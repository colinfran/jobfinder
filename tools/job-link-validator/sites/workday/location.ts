import type { WorkdayCxsDetailResponse, WorkdayLocationInfo, WorkdayPosting } from "./types"

export function isValidWorkdayLocation(locationInfo: WorkdayLocationInfo): boolean {
  const { locations, remoteType } = locationInfo

  if (locations.length === 0) {
    return false
  }

  const normalizedRemoteType = remoteType?.toLowerCase() || null

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

  const hasSF = locations.some((location) => {
    const normalizedLocation = location.toLowerCase()
    return sfVariations.some((variation) => normalizedLocation.includes(variation))
  })

  const isRemote =
    normalizedRemoteType === "remote" ||
    locations.some((loc) => loc.toLowerCase().includes("remote"))

  if (normalizedRemoteType === "on-site") {
    return hasSF
  }

  if (normalizedRemoteType === "hybrid" || normalizedRemoteType === "remote") {
    return isRemote || hasSF
  }

  if (remoteType) {
    return false
  }

  return hasSF || isRemote
}

export function extractLocationInfoFromPosting(
  posting: WorkdayPosting,
): WorkdayLocationInfo | null {
  const locations = posting.locationsText
    ? posting.locationsText
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean)
    : []

  const remoteType = typeof posting.remoteType === "string" ? posting.remoteType : null
  if (locations.length === 0) return null

  return { locations, remoteType }
}

export function extractLocationInfoFromDetail(
  response: WorkdayCxsDetailResponse,
): WorkdayLocationInfo | null {
  const info = response.jobPostingInfo
  if (!info) return null

  const locations: string[] = []
  if (info.location) locations.push(info.location)
  if (Array.isArray(info.additionalLocations)) {
    locations.push(...info.additionalLocations)
  }

  if (locations.length === 0) {
    return null
  }

  return { locations, remoteType: info.remoteType ?? null }
}
