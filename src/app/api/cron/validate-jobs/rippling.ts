export const extractRipplingWorkLocationsFromNextData = (body: string): string[] | null => {
  const nextDataMatch = body.match(
    /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i,
  )
  const jsonText = nextDataMatch?.[1]?.trim()
  if (!jsonText) return null

  try {
    const payload = JSON.parse(jsonText) as {
      props?: {
        pageProps?: {
          apiData?: {
            workLocations?: string[]
            jobPost?: {
              workLocations?: string[]
            }
          }
          workLocations?: string[]
        }
      }
    }

    const apiLocations = payload.props?.pageProps?.apiData?.workLocations
    const jobPostLocations = payload.props?.pageProps?.apiData?.jobPost?.workLocations
    const pageLocations = payload.props?.pageProps?.workLocations
    const locations = apiLocations ?? jobPostLocations ?? pageLocations

    if (!Array.isArray(locations) || locations.length === 0) {
      return null
    }

    return locations.filter((value) => typeof value === "string" && value.trim().length > 0)
  } catch {
    return null
  }
}

export const extractRipplingLocationFromSidebar = (body: string): string | null => {
  const locationBlockMatch = body.match(
    /data-icon=["']LOCATION_OUTLINE["'][\s\S]*?<p[^>]*>([^<]+)<\/p>/i,
  )
  return locationBlockMatch?.[1]?.trim() || null
}

export const isValidRipplingLocation = (location: string | null): boolean => {
  if (!location) {
    return false
  }

  const normalizedLocation = location.toLowerCase()

  if (normalizedLocation.includes("remote")) {
    return true
  }

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

  return sfVariations.some((variation) => normalizedLocation.includes(variation))
}

export const isRipplingJobPageValid = (body: string): boolean => {
  const normalizedBody = body.toLowerCase()

  if (
    normalizedBody.includes("the page you're looking for doesn't exist") ||
    normalizedBody.includes("the link you followed may be broken") ||
    normalizedBody.includes("listing may have been removed") ||
    normalizedBody.includes("404 | page not found")
  ) {
    return false
  }

  if (!normalizedBody.includes("apply now")) {
    return false
  }

  const workLocations = extractRipplingWorkLocationsFromNextData(body)
  if (workLocations && workLocations.length > 0) {
    return workLocations.some((location) => isValidRipplingLocation(location))
  }

  const fallbackLocation = extractRipplingLocationFromSidebar(body)
  return isValidRipplingLocation(fallbackLocation)
}
