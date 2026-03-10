import type { Page } from "puppeteer"
import type { GemLocationInfo } from "./types"

const WORKPLACE_VALUES = ["hybrid", "remote", "in office", "on-site", "on site", "onsite"]

const cleanText = (value: string): string => value.replace(/\s+/g, " ").trim()

type JsonObject = Record<string, unknown>

const asObject = (value: unknown): JsonObject | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as JsonObject
}

const readText = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null
  }

  const cleaned = cleanText(value)
  return cleaned.length > 0 ? cleaned : null
}

const collectJsonLdObjects = (value: unknown): JsonObject[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectJsonLdObjects(item))
  }

  const obj = asObject(value)
  if (!obj) {
    return []
  }

  const graph = obj["@graph"]
  if (Array.isArray(graph)) {
    return graph.flatMap((item) => collectJsonLdObjects(item))
  }

  return [obj]
}

const extractJobPostingFromJsonLd = (html: string): GemLocationInfo => {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

  let workplaceType: string | null = null
  let location: string | null = null
  let match = scriptRegex.exec(html)

  while (match) {
    const rawJson = match[1]?.trim()

    if (!rawJson) {
      match = scriptRegex.exec(html)
      continue
    }

    try {
      const parsed = JSON.parse(rawJson) as unknown
      const objects = collectJsonLdObjects(parsed)

      for (const obj of objects) {
        const type = readText(obj["@type"])
        if (type?.toLowerCase() !== "jobposting") {
          continue
        }

        const locationType = readText(obj.jobLocationType)
        if (locationType?.toLowerCase().includes("telecommute")) {
          workplaceType = "remote"
        }

        const jobLocation = obj.jobLocation
        const locations = Array.isArray(jobLocation) ? jobLocation : [jobLocation]

        for (const item of locations) {
          const locationObj = asObject(item)
          const addressObj = asObject(locationObj?.address)

          const parts = [
            readText(locationObj?.name),
            readText(addressObj?.addressLocality),
            readText(addressObj?.addressRegion),
            readText(addressObj?.addressCountry),
          ].filter((value): value is string => Boolean(value))

          if (parts.length > 0) {
            location = cleanText(parts.join(", "))
            break
          }
        }

        if (!location) {
          const req = obj.applicantLocationRequirements
          const reqEntries = Array.isArray(req) ? req : [req]

          for (const entry of reqEntries) {
            const reqObj = asObject(entry)
            const reqAddress = asObject(reqObj?.address)
            const country = readText(reqAddress?.addressCountry) ?? readText(reqObj?.name)

            if (country) {
              location = country
              break
            }
          }
        }

        if (location || workplaceType) {
          return { location, workplaceType }
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }

    match = scriptRegex.exec(html)
  }

  return { location, workplaceType }
}

const extractClassTextValues = (html: string, classPrefix: string): string[] => {
  const values: string[] = []
  const regex = new RegExp(`<div\\s+class="${classPrefix}-\\d+"[^>]*>([\\s\\S]*?)<\\/div>`, "gi")

  let match = regex.exec(html)
  while (match) {
    const raw = match[1] ?? ""
    const stripped = cleanText(raw.replace(/<[^>]*>/g, " "))
    if (stripped) values.push(stripped)
    match = regex.exec(html)
  }

  return values
}

export function hasGemError(html: string): boolean {
  const normalized = html.toLowerCase()
  return (
    normalized.includes("job not found") ||
    normalized.includes("the link you followed may be out of date") ||
    normalized.includes("this job post may have been removed") ||
    normalized.includes("page not found") ||
    normalized.includes("this position has been filled") ||
    normalized.includes("this role has been filled") ||
    normalized.includes("no longer accepting applications")
  )
}

export function extractGemLocationFromHtml(html: string): GemLocationInfo {
  const jsonLdLocation = extractJobPostingFromJsonLd(html)

  const iconLabelValues = extractClassTextValues(html, "iconLabel")
  const labelTextValues = extractClassTextValues(html, "labelText")
  const metaValues = [...iconLabelValues, ...labelTextValues]

  const workplaceType =
    metaValues.find((value) => WORKPLACE_VALUES.includes(value.toLowerCase())) ??
    jsonLdLocation.workplaceType ??
    null

  const location =
    jsonLdLocation.location ??
    iconLabelValues.find((value) => {
      const lower = value.toLowerCase()
      return !WORKPLACE_VALUES.includes(lower)
    }) ??
    null

  return {
    workplaceType: workplaceType ? cleanText(workplaceType) : null,
    location: location ? cleanText(location) : null,
  }
}

export async function extractGemLocationFromPage(page: Page): Promise<GemLocationInfo> {
  const content = await page.content()
  return extractGemLocationFromHtml(content)
}
