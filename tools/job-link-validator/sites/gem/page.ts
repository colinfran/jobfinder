import type { Page } from "puppeteer"
import type { GemLocationInfo } from "./types"

const WORKPLACE_VALUES = ["hybrid", "remote", "in office", "on-site", "on site", "onsite"]

const LOCATION_HINT_REGEX =
  /(san francisco|bay area|sf bay|san jose|oakland|berkeley|palo alto|mountain view|redwood city|menlo park|fremont|remote)/i

const cleanText = (value: string): string => value.replace(/\s+/g, " ").trim()

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
  const normalized = cleanText(html.replace(/<[^>]*>/g, " "))

  const iconLabelValues = extractClassTextValues(html, "iconLabel")
  const labelTextValues = extractClassTextValues(html, "labelText")
  const metaValues = [...iconLabelValues, ...labelTextValues]

  const workplaceType =
    metaValues.find((value) => WORKPLACE_VALUES.includes(value.toLowerCase())) ??
    normalized.match(/\b(hybrid|remote|in office|on-site|on site|onsite)\b/i)?.[1] ??
    null

  const location =
    iconLabelValues.find((value) => {
      const lower = value.toLowerCase()
      if (WORKPLACE_VALUES.includes(lower)) return false
      return LOCATION_HINT_REGEX.test(value)
    }) ??
    normalized.match(
      /\b(san francisco(?:\s*bay\s*area)?|bay area|sf bay(?: area)?|san jose|oakland|berkeley|palo alto|mountain view|redwood city|menlo park|fremont|remote)\b/i,
    )?.[1] ??
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
