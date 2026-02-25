import type { Page } from "puppeteer"
import type { LocationInfo } from "./types"

export function hasAshbyError(html: string): boolean {
  const normalized = html.toLowerCase()
  return (
    normalized.includes("the job you requested was not found") ||
    normalized.includes("job not found") ||
    normalized.includes("page not found")
  )
}

export async function extractAshbyLocationFromPage(page: Page): Promise<LocationInfo> {
  return page.evaluate(() => {
    const getValue = (label: string): string | null => {
      const headings = Array.from(document.querySelectorAll("h2"))
      const heading = headings.find(
        (node) => (node.textContent || "").trim().toLowerCase() === label,
      )
      if (!heading) return null

      const parent = heading.parentElement
      const value = parent?.querySelector("p")?.textContent || ""
      return value.trim() || null
    }

    return {
      location: getValue("location"),
      locationType: getValue("location type"),
    }
  })
}
