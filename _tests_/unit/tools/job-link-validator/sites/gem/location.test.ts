/** @jest-environment node */
import { isValidGemLocation } from "../../../../../../tools/job-link-validator/sites/gem/location"

describe("tools/job-link-validator/sites/gem/location", () => {
  it("accepts Bay Area in-office and hybrid locations", () => {
    expect(
      isValidGemLocation({
        location: "San Francisco • Oakland",
        workplaceType: "In office",
      }),
    ).toBe(true)

    expect(
      isValidGemLocation({
        location: "Palo Alto",
        workplaceType: "Hybrid",
      }),
    ).toBe(true)
  })

  it("accepts explicit remote locations", () => {
    expect(
      isValidGemLocation({
        location: "Remote",
        workplaceType: "Remote",
      }),
    ).toBe(true)

    expect(
      isValidGemLocation({
        location: "United States • Remote",
        workplaceType: "Hybrid",
      }),
    ).toBe(true)
  })

  it("rejects non-SF locations without explicit remote", () => {
    expect(
      isValidGemLocation({
        location: "Athens, Greece",
        workplaceType: "Hybrid",
      }),
    ).toBe(false)
  })

  it("rejects mixed SF + non-SF when not explicitly remote", () => {
    expect(
      isValidGemLocation({
        location: "San Francisco • New York",
        workplaceType: "In office",
      }),
    ).toBe(false)
  })
})
