import type { LocationInfo } from "./types"

export function extractAshbyLocation(html: string): LocationInfo {
  const locationMatch = html.match(/<h2[^>]*>Location<\/h2>\s*<p[^>]*>([^<]+)<\/p>/i)
  const location = locationMatch?.[1]?.trim() || null

  const locationTypeMatch = html.match(/<h2[^>]*>Location Type<\/h2>\s*<p[^>]*>([^<]+)<\/p>/i)
  const locationType = locationTypeMatch?.[1]?.trim() || null

  return { location, locationType }
}

export function extractAshbyLocationFromText(
  location: string | null,
  locationType: string | null,
): LocationInfo {
  return { location, locationType }
}

export function isValidAshbyLocation(locationInfo: LocationInfo): boolean {
  const { location, locationType } = locationInfo

  if (!location) {
    return false
  }

  const normalizedLocation = location.toLowerCase()
  const normalizedLocationType = locationType?.toLowerCase() || null

  const sfVariations = [
    "san francisco",
    "sf bay area",
    "sf bay",
    "bay area",
    "san francisco bay area",
    "san francisco,",
    "sf,",
    "sf ",
  ]
  const hasSF = sfVariations.some((variation) => normalizedLocation.includes(variation))
  const hasUS = /\b(united states|u\.?s\.?a?)\b/i.test(location)

  // "Location Type: Remote" alone is too broad (e.g. country-restricted remote roles).
  // Remote roles must explicitly indicate the US in location text.
  const isRemote = normalizedLocation.includes("remote")
  const isRemoteInUS = isRemote && hasUS

  if (normalizedLocationType === "on-site") {
    return hasSF
  }

  if (normalizedLocationType === "hybrid" || normalizedLocationType === "remote") {
    return hasSF || hasUS
  }

  if (locationType) {
    return false
  }

  return hasSF || isRemoteInUS
}
