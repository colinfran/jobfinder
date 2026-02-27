import {
  extractRipplingLocationFromSidebar,
  extractRipplingWorkLocationsFromNextData,
  isRipplingJobPageValid,
  isValidRipplingLocation,
} from "@/app/api/cron/validate-jobs/rippling"

describe("validate-jobs/rippling", () => {
  it("extracts workLocations from __NEXT_DATA__", () => {
    const html = `
      <script id="__NEXT_DATA__" type="application/json">
        {"props":{"pageProps":{"apiData":{"workLocations":["San Francisco (Hybrid), New York"]}}}}
      </script>
    `

    expect(extractRipplingWorkLocationsFromNextData(html)).toEqual([
      "San Francisco (Hybrid), New York",
    ])
  })

  it("extracts location from sidebar fallback", () => {
    const html = `
      <span data-icon="LOCATION_OUTLINE"></span>
      <p class="css-1kiaia6">Remote - United States</p>
    `

    expect(extractRipplingLocationFromSidebar(html)).toBe("Remote - United States")
  })

  it("applies rippling location validation rules", () => {
    expect(isValidRipplingLocation("Remote - United States")).toBe(true)
    expect(isValidRipplingLocation("San Francisco (Hybrid), New York")).toBe(true)
    expect(isValidRipplingLocation("Athens, Greece")).toBe(false)
    expect(isValidRipplingLocation(null)).toBe(false)
  })

  it("marks invalid-page copy as invalid", () => {
    const html = `
      <h1>The page you're looking for doesn't exist</h1>
      <p>The link you followed may be broken or the listing may have been removed.</p>
    `

    expect(isRipplingJobPageValid(html)).toBe(false)
  })

  it("accepts valid rippling page with apply button and valid location", () => {
    const html = `
      <button>Apply now</button>
      <script id="__NEXT_DATA__" type="application/json">
        {"props":{"pageProps":{"apiData":{"workLocations":["Remote - United States"]}}}}
      </script>
    `

    expect(isRipplingJobPageValid(html)).toBe(true)
  })
})
