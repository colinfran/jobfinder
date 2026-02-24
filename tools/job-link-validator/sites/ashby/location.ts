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

  const isRemote = normalizedLocation.includes("remote") || normalizedLocationType === "remote"

  if (normalizedLocationType === "on-site") {
    return hasSF
  }

  if (normalizedLocationType === "hybrid" || normalizedLocationType === "remote") {
    return isRemote || hasSF
  }

  if (locationType) {
    return false
  }

  return hasSF || isRemote
}
