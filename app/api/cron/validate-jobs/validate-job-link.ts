// Helper: normalize a URL to detect duplicates
export const normalizeJobUrl = (link: string): string => {
  try {
    const url = new URL(link)
    // Remove trailing slash
    let pathname = url.pathname.replace(/\/$/, "")
    // Remove common suffixes that don't change the job posting
    pathname = pathname.replace(/\/(application|career-opportunity)$/, "")
    // Reconstruct normalized URL
    return `${url.protocol}//${url.hostname}${pathname}`
  } catch {
    return link
  }
}

// Helper: check if a job link is still active
export const isLinkStillValid = async (link: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(link, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    clearTimeout(timeout)

    // Consider 2xx and 3xx as valid, 4xx and 5xx as invalid
    return response.status < 400
  } catch (error) {
    // Timeout, network error, or other issues = treat as invalid
    return false
  }
}
