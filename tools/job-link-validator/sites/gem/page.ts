import type { Page } from "puppeteer"
import type { GemLocationInfo } from "./types"

export function hasGemError(html: string): boolean {
  const normalized = html.toLowerCase()
  return (
    normalized.includes("job not found") ||
    normalized.includes("page not found") ||
    normalized.includes("this position has been filled") ||
    normalized.includes("this role has been filled") ||
    normalized.includes("no longer accepting applications")
  )
}

export async function extractGemLocationFromPage(page: Page): Promise<GemLocationInfo> {
  return page.evaluate(() => {
    const bodyText = (document.body?.innerText || "").replace(/\s+/g, " ").trim()
    const lines = (document.body?.innerText || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    const topLines = lines.slice(0, 40)
    const workplaceLine =
      topLines.find((line) => /^(hybrid|remote|in office|on-site|on site|onsite)$/i.test(line)) ||
      null

    const locationLine =
      topLines.find(
        (line) =>
          !/^(hybrid|remote|in office|on-site|on site|onsite)$/i.test(line) &&
          /(san francisco|bay area|san jose|california|united states|u\.s\.|usa|sofia|new york|seattle)/i.test(
            line,
          ),
      ) || null

    const fallbackWorkplace = bodyText.match(
      /\b(hybrid|remote|in office|on-site|on site|onsite)\b/i,
    )
    const fallbackLocation = bodyText.match(
      /\b(san francisco(?:\s*bay\s*area)?|bay area|san jose|california|united states|u\.s\.?|usa|sofia|new york|seattle)\b/i,
    )

    return {
      workplaceType: workplaceLine ?? fallbackWorkplace?.[1] ?? null,
      location: locationLine ?? fallbackLocation?.[1] ?? null,
    }
  })
}
