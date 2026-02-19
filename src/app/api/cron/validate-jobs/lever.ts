export const extractLeverLocation = (body: string): string | null => {
  // Extract location from twitter:data1 meta tag (where twitter:label1 is "Location")
  const locationMatch = body.match(
    /<meta\s+name="twitter:label1"\s+value="Location"\s*\/>\s*<meta\s+name="twitter:data1"\s+value="([^"]+)"\s*\/>/i,
  )
  return locationMatch?.[1]?.trim() || null
}

export const extractLeverWorkplaceType = (body: string): string | null => {
  // Extract workplace type from the workplaceTypes div
  const workplaceMatch = body.match(
    /<div[^>]*class="[^"]*workplaceTypes[^"]*"[^>]*>([^<]+)<\/div>/i,
  )
  return workplaceMatch?.[1]?.trim() || null
}

export const isValidLeverLocation = (
  location: string | null,
  workplaceType: string | null,
): boolean => {
  // If location is missing, treat as invalid
  if (!location) {
    return false
  }

  const normalizedLocation = location.toLowerCase()
  const normalizedWorkplaceType = workplaceType?.toLowerCase() || null

  // Check for San Francisco variations
  const sfVariations = [
    "san francisco",
    "sf bay area",
    "sf bay",
    "bay area",
    "san francisco bay area",
    "san francisco,",
    "sf,",
    "sf ", // with space
  ]
  const hasSF = sfVariations.some((variation) => normalizedLocation.includes(variation))

  // Check if remote
  const isRemote = normalizedLocation.includes("remote") || normalizedWorkplaceType === "remote"

  // If workplace type is not specified, be permissive (include it)
  if (!workplaceType) {
    return true
  }

  // For "On-site", only valid if in SF area
  if (normalizedWorkplaceType === "on-site") {
    return hasSF
  }

  // For Remote or Hybrid, check if remote or SF area
  return isRemote || hasSF
}

export const isLeverJobPageValid = (body: string): boolean => {
  // Check if the "Apply for this job" button exists
  if (!body.includes("Apply for this job")) {
    return false
  }

  // Extract and validate location
  const location = extractLeverLocation(body)
  const workplaceType = extractLeverWorkplaceType(body)

  return isValidLeverLocation(location, workplaceType)
}
