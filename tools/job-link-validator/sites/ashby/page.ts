import type { Page } from "puppeteer"
import type { LocationInfo } from "./types"

export function hasAshbyError(html: string): boolean {
  return html.includes("The job you requested was not found") || html.includes("Job not found")
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
