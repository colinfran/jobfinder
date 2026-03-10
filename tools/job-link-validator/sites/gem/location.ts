import type { GemLocationInfo } from "./types"

export function isValidGemLocation(locationInfo: GemLocationInfo): boolean {
  const { location, workplaceType } = locationInfo

  if (!location) {
    return false
  }

  const normalizedLocation = location.toLowerCase()
  const normalizedWorkplaceType = workplaceType?.toLowerCase() || null

  const sfVariations = [
    "san francisco",
    "sf bay area",
    "sf bay",
    "bay area",
    "san francisco bay area",
    "san francisco,",
    "sf,",
    "sf ",
    "san jose",
    "oakland",
    "berkeley",
    "palo alto",
    "mountain view",
    "redwood city",
    "menlo park",
    "fremont",
  ]

  const clearlyNonSFMarkers = [
    "new york",
    "athens",
    "greece",
    "canada",
    "czech",
    "czech republic",
    "czechia",
    "brno",
    "prague",
    "emea",
    "europe",
    "uk",
    "united kingdom",
    "london",
    "seattle",
    "austin",
    "boston",
    "los angeles",
  ]

  const usMarkers = ["united states", "u.s.", "us", "usa", "u.s.a"]

  const hasSF = sfVariations.some((variation) => normalizedLocation.includes(variation))
  const hasRemote = normalizedLocation.includes("remote")
  const hasClearlyNonSFMarker = clearlyNonSFMarkers.some((marker) =>
    normalizedLocation.includes(marker),
  )
  const hasUSMarker = usMarkers.some((marker) => normalizedLocation.includes(marker))

  const isAllowedRemoteLocation = hasRemote && (hasSF || hasUSMarker)

  if (normalizedWorkplaceType === "in office" || normalizedWorkplaceType === "on-site") {
    return hasSF && !hasClearlyNonSFMarker
  }

  if (normalizedWorkplaceType === "hybrid" || normalizedWorkplaceType === "remote") {
    if (!(hasSF || isAllowedRemoteLocation)) {
      return false
    }
    return !hasClearlyNonSFMarker
  }

  if (workplaceType) {
    return false
  }

  if (!(hasSF || isAllowedRemoteLocation)) {
    return false
  }

  return !hasClearlyNonSFMarker
}
