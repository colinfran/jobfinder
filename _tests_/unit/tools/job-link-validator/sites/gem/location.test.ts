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

  it("rejects non-Bay-Area locations", () => {
    expect(
      isValidGemLocation({
        location: "Athens, Greece",
        workplaceType: "Hybrid",
      }),
    ).toBe(false)

    expect(
      isValidGemLocation({
        location: "Remote",
        workplaceType: "Remote",
      }),
    ).toBe(false)
  })

  it("rejects mixed Bay Area + non-Bay-Area locations", () => {
    expect(
      isValidGemLocation({
        location: "San Francisco • New York",
        workplaceType: "In office",
      }),
    ).toBe(false)
  })
})
