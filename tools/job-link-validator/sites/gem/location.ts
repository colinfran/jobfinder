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
  ]

  const hasSF = sfVariations.some((variation) => normalizedLocation.includes(variation))
  const hasUS = /\b(united states|u\.?s\.?a?)\b/i.test(location)
  const isRemote = normalizedLocation.includes("remote")

  if (normalizedWorkplaceType === "in office" || normalizedWorkplaceType === "on-site") {
    return hasSF
  }

  if (normalizedWorkplaceType === "hybrid" || normalizedWorkplaceType === "remote") {
    return hasSF || hasUS
  }

  if (workplaceType) {
    return false
  }

  return hasSF || (hasUS && isRemote)
}
