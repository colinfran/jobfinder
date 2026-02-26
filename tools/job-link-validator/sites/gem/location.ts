import type { GemLocationInfo } from "./types"

export function isValidGemLocation(locationInfo: GemLocationInfo): boolean {
  const { location, workplaceType } = locationInfo

  if (!location) {
    return false
  }

  const normalizedLocation = location.toLowerCase()
  const normalizedWorkplaceType = workplaceType?.toLowerCase() || null

  const bayAreaVariations = [
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

  const clearlyNonBayAreaMarkers = [
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

  const hasBayArea = bayAreaVariations.some((variation) => normalizedLocation.includes(variation))
  const hasClearlyNonBayAreaMarker = clearlyNonBayAreaMarkers.some((marker) =>
    normalizedLocation.includes(marker),
  )

  if (hasClearlyNonBayAreaMarker) {
    return false
  }

  if (normalizedWorkplaceType === "in office" || normalizedWorkplaceType === "on-site") {
    return hasBayArea
  }

  if (normalizedWorkplaceType === "hybrid" || normalizedWorkplaceType === "remote") {
    return hasBayArea
  }

  if (workplaceType) {
    return false
  }

  return hasBayArea
}
