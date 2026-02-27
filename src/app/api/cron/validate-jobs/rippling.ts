type RipplingNextData = {
  props?: {
    pageProps?: {
      apiData?: {
        workLocations?: string[]
        jobPost?: {
          uuid?: string
          workLocations?: string[]
        }
      }
      workLocations?: string[]
    }
  }
}

const parseRipplingNextData = (body: string): RipplingNextData | null => {
  const nextDataMatch = body.match(
    /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i,
  )
  const jsonText = nextDataMatch?.[1]?.trim()
  if (!jsonText) return null

  try {
    return JSON.parse(jsonText) as RipplingNextData
  } catch {
    return null
  }
}

export const extractRipplingWorkLocationsFromNextData = (body: string): string[] | null => {
  const payload = parseRipplingNextData(body)
  if (!payload) {
    return null
  }

  const apiLocations = payload.props?.pageProps?.apiData?.workLocations
  const jobPostLocations = payload.props?.pageProps?.apiData?.jobPost?.workLocations
  const pageLocations = payload.props?.pageProps?.workLocations
  const locations = apiLocations ?? jobPostLocations ?? pageLocations

  if (!Array.isArray(locations) || locations.length === 0) {
    return null
  }

  return locations.filter((value) => typeof value === "string" && value.trim().length > 0)
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
  const nextData = parseRipplingNextData(body)
  const hasJobPostUuid = Boolean(nextData?.props?.pageProps?.apiData?.jobPost?.uuid)

  if (!hasJobPostUuid) {
    const hasNotFoundHeading = />\s*The page you're looking for doesn't exist\s*</i.test(body)
    const hasNotFoundCaption =
      />\s*The link you followed may be broken or the listing may have been removed\.\s*</i.test(
        body,
      )
    const has404Title = /<title>\s*404\s*\|\s*page not found\s*<\/title>/i.test(body)

    if ((hasNotFoundHeading && hasNotFoundCaption) || has404Title) {
      return false
    }
  }

  const normalizedBody = body.toLowerCase()

  if (!hasJobPostUuid && !normalizedBody.includes("apply now")) {
    return false
  }

  const workLocations = extractRipplingWorkLocationsFromNextData(body)
  if (workLocations && workLocations.length > 0) {
    return workLocations.some((location) => isValidRipplingLocation(location))
  }

  const fallbackLocation = extractRipplingLocationFromSidebar(body)
  return isValidRipplingLocation(fallbackLocation)
}
