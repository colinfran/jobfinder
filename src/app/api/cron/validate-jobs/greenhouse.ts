export const extractGreenhouseCanonicalUrl = (body: string): string | null => {
  const match = body.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/i)
  return match?.[1] ?? null
}

export const extractGreenhouseLocation = (body: string): string | null => {
  const match = body.match(/<meta\s+property="og:description"\s+content="([^"]*)"\s*\/?>/i)
  return match?.[1] ?? null
}

export const isValidLocation = (location: string | null): boolean => {
  if (!location || location.trim() === "") {
    return false // Empty description = error page or invalid
  }

  const normalizedLocation = location.toLowerCase()

  // Check for remote positions
  if (normalizedLocation.includes("remote")) {
    return true
  }

  // Check for San Francisco variations
  const sfVariations = [
    "san francisco",
    "sf bay area",
    "sf bay",
    "bay area",
    "san francisco bay area",
    "san francisco, ca",
    "sf,",
    "sf ", // with space to avoid matching unrelated words
  ]

  return sfVariations.some((variation) => normalizedLocation.includes(variation))
}

export const isGreenhouseJobPageValid = (requestedUrl: URL, body: string): boolean => {
  // Check for explicit error messages
  if (body.includes("This job is no longer available") || body.includes("not found")) {
    return false
  }

  // Check location from og:description meta tag
  const location = extractGreenhouseLocation(body)
  if (!isValidLocation(location)) {
    return false
  }

  // Extract canonical URL from the HTML head
  const canonicalUrl = extractGreenhouseCanonicalUrl(body)
  if (!canonicalUrl) {
    return true // If no canonical tag found, assume valid (edge case fallback)
  }

  try {
    const canonical = new URL(canonicalUrl)

    // If canonical URL has error=true parameter, the job is invalid
    if (canonical.searchParams.get("error") === "true") {
      return false
    }

    // Compare job IDs: requested vs canonical
    const requestedPath = requestedUrl.pathname.replace(/\/+$/, "")
    const canonicalPath = canonical.pathname.replace(/\/+$/, "")
    const requestedJobId = requestedPath.match(/\/jobs\/(\d+)/)?.[1]
    const canonicalJobId = canonicalPath.match(/\/jobs\/(\d+)/)?.[1]

    // If we requested a job ID but canonical has none (redirected to board), it's invalid
    if (requestedJobId && !canonicalJobId) {
      return false
    }

    // If job IDs differ, the original job was redirected/removed
    if (requestedJobId && canonicalJobId && requestedJobId !== canonicalJobId) {
      return false
    }
  } catch {
    return true // Parse error = assume valid (conservative fallback)
  }

  return true
}
