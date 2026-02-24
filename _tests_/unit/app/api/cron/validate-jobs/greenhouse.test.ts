import {
  extractGreenhouseCanonicalUrl,
  extractGreenhouseLocation,
  isGreenhouseJobPageValid,
  isValidLocation,
} from "@/app/api/cron/validate-jobs/greenhouse"

describe("validate-jobs/greenhouse", () => {
  it("extracts canonical url and location", () => {
    const body = `
      <head>
        <link rel="canonical" href="https://boards.greenhouse.io/acme/jobs/12345" />
        <meta property="og:description" content="San Francisco, CA" />
      </head>
    `

    expect(extractGreenhouseCanonicalUrl(body)).toBe("https://boards.greenhouse.io/acme/jobs/12345")
    expect(extractGreenhouseLocation(body)).toBe("San Francisco, CA")
  })

  it("validates supported SF/remote locations", () => {
    expect(isValidLocation("Remote - US")).toBe(true)
    expect(isValidLocation("San Francisco Bay Area")).toBe(true)
    expect(isValidLocation("Austin, TX")).toBe(false)
    expect(isValidLocation("")).toBe(false)
  })

  it("marks removed job copy as invalid", () => {
    const body = `<html>This job is no longer available</html>`
    const requestedUrl = new URL("https://boards.greenhouse.io/acme/jobs/12345")

    expect(isGreenhouseJobPageValid(requestedUrl, body)).toBe(false)
  })

  it("marks canonical error=true as invalid", () => {
    const body = `
      <meta property="og:description" content="San Francisco, CA" />
      <link rel="canonical" href="https://boards.greenhouse.io/acme/jobs/12345?error=true" />
    `
    const requestedUrl = new URL("https://boards.greenhouse.io/acme/jobs/12345")

    expect(isGreenhouseJobPageValid(requestedUrl, body)).toBe(false)
  })

  it("marks mismatched canonical job id as invalid", () => {
    const body = `
      <meta property="og:description" content="Remote" />
      <link rel="canonical" href="https://boards.greenhouse.io/acme/jobs/99999" />
    `
    const requestedUrl = new URL("https://boards.greenhouse.io/acme/jobs/12345")

    expect(isGreenhouseJobPageValid(requestedUrl, body)).toBe(false)
  })

  it("returns true for valid sf page", () => {
    const body = `<meta property="og:description" content="San Francisco, CA" />`
    const requestedUrl = new URL("https://boards.greenhouse.io/acme/jobs/12345")

    expect(isGreenhouseJobPageValid(requestedUrl, body)).toBe(true)
  })
})
