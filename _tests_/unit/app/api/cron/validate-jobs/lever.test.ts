import {
  extractLeverLocation,
  extractLeverWorkplaceType,
  isLeverJobPageValid,
  isValidLeverLocation,
} from "@/app/api/cron/validate-jobs/lever"

describe("validate-jobs/lever", () => {
  it("extracts location and workplace type", () => {
    const body = `
      <meta name="twitter:label1" value="Location" />
      <meta name="twitter:data1" value="San Francisco, CA" />
      <div class="posting-categories"><div class="workplaceTypes">On-site</div></div>
      Apply for this job
    `

    expect(extractLeverLocation(body)).toBe("San Francisco, CA")
    expect(extractLeverWorkplaceType(body)).toBe("On-site")
  })

  it("applies workplace validation rules", () => {
    expect(isValidLeverLocation("San Francisco, CA", "On-site")).toBe(true)
    expect(isValidLeverLocation("Austin, TX", "On-site")).toBe(false)
    expect(isValidLeverLocation("Austin, TX", "Remote")).toBe(true)
    expect(isValidLeverLocation("Austin, TX", null)).toBe(true)
    expect(isValidLeverLocation(null, "Remote")).toBe(false)
  })

  it("requires apply button and valid location", () => {
    const validBody = `
      <meta name="twitter:label1" value="Location" />
      <meta name="twitter:data1" value="San Francisco, CA" />
      <div class="workplaceTypes">On-site</div>
      Apply for this job
    `
    const noApplyButtonBody = `
      <meta name="twitter:label1" value="Location" />
      <meta name="twitter:data1" value="San Francisco, CA" />
      <div class="workplaceTypes">On-site</div>
    `

    expect(isLeverJobPageValid(validBody)).toBe(true)
    expect(isLeverJobPageValid(noApplyButtonBody)).toBe(false)
  })
})
