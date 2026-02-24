import { isGreenhouseJobPageValid } from "../greenhouse"
import { isLeverJobPageValid } from "../lever"

export const hasUnnecessarySuffix = (link: string): boolean => {
  try {
    const url = new URL(link)
    return /\/(application|apply)$/.test(url.pathname)
  } catch {
    return false
  }
}

export const isLinkStillValid = async (link: string): Promise<boolean> => {
  try {
    const url = new URL(link)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(link, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    clearTimeout(timeout)

    if (response.status >= 400) {
      return false
    }

    const body = await response.text()

    if (url.hostname.includes("lever.co")) {
      return isLeverJobPageValid(body)
    }

    if (url.hostname.includes("greenhouse")) {
      return isGreenhouseJobPageValid(url, body)
    }

    // Workday + Ashby are validated by GitHub Actions browser workflows.
    return true
  } catch (error) {
    console.log(`❌ Error validating link ${link}:`, error instanceof Error ? error.message : error)
    return false
  }
}
