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
    "london",
    "seattle",
    "austin",
    "boston",
    "los angeles",
  ]

  const hasSF = sfVariations.some((variation) => normalizedLocation.includes(variation))
  const hasRemote = normalizedLocation.includes("remote")
  const hasClearlyNonSFMarker = clearlyNonSFMarkers.some((marker) =>
    normalizedLocation.includes(marker),
  )

  if (normalizedWorkplaceType === "in office" || normalizedWorkplaceType === "on-site") {
    return hasSF && !hasClearlyNonSFMarker
  }

  if (normalizedWorkplaceType === "hybrid" || normalizedWorkplaceType === "remote") {
    if (!(hasSF || hasRemote)) {
      return false
    }
    return !hasClearlyNonSFMarker || hasRemote
  }

  if (workplaceType) {
    return false
  }

  if (!(hasSF || hasRemote)) {
    return false
  }

  return !hasClearlyNonSFMarker || hasRemote
}
