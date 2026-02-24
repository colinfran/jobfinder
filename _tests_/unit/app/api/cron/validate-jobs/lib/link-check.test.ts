import {
  hasUnnecessarySuffix,
  isLinkStillValid,
  validateLinkWithReason,
} from "@/app/api/cron/validate-jobs/lib/link-check"
import { isGreenhouseJobPageValid } from "@/app/api/cron/validate-jobs/greenhouse"
import { isLeverJobPageValid } from "@/app/api/cron/validate-jobs/lever"

jest.mock("@/app/api/cron/validate-jobs/greenhouse", () => ({
  isGreenhouseJobPageValid: jest.fn(),
}))

jest.mock("@/app/api/cron/validate-jobs/lever", () => ({
  isLeverJobPageValid: jest.fn(),
}))

describe("validate-jobs/lib/link-check", () => {
  const mockedGreenhouseValidation = jest.mocked(isGreenhouseJobPageValid)
  const mockedLeverValidation = jest.mocked(isLeverJobPageValid)

  beforeEach(() => {
    global.fetch = jest.fn()
    mockedGreenhouseValidation.mockReset()
    mockedLeverValidation.mockReset()
  })

  it("detects suffixes", () => {
    expect(hasUnnecessarySuffix("https://jobs.lever.co/acme/uuid/apply")).toBe(true)
    expect(hasUnnecessarySuffix("https://jobs.ashbyhq.com/acme/uuid/application")).toBe(true)
    expect(hasUnnecessarySuffix("https://boards.greenhouse.io/acme/jobs/1")).toBe(false)
  })

  it("returns invalid-url for malformed links", async () => {
    await expect(validateLinkWithReason("bad-link")).resolves.toEqual({
      isValid: false,
      reason: "invalid-url",
    })
  })

  it("returns http-error for 4xx/5xx", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 404,
      text: async () => "not found",
    })

    await expect(
      validateLinkWithReason("https://boards.greenhouse.io/acme/jobs/1"),
    ).resolves.toEqual({
      isValid: false,
      reason: "http-error",
      status: 404,
    })
  })

  it("delegates lever content validation", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      text: async () => "html",
    })
    mockedLeverValidation.mockReturnValue(false)

    await expect(validateLinkWithReason("https://jobs.lever.co/acme/uuid")).resolves.toEqual({
      isValid: false,
      reason: "lever-content-invalid",
    })

    mockedLeverValidation.mockReturnValue(true)

    await expect(validateLinkWithReason("https://jobs.lever.co/acme/uuid")).resolves.toEqual({
      isValid: true,
      reason: "validated",
    })
  })

  it("delegates greenhouse content validation", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      text: async () => "html",
    })
    mockedGreenhouseValidation.mockReturnValue(false)

    await expect(
      validateLinkWithReason("https://boards.greenhouse.io/acme/jobs/12345"),
    ).resolves.toEqual({
      isValid: false,
      reason: "greenhouse-content-invalid",
    })
  })

  it("returns non-target-source for other hosts", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      text: async () => "html",
    })

    await expect(validateLinkWithReason("https://example.com/jobs/1")).resolves.toEqual({
      isValid: true,
      reason: "non-target-source",
    })
  })

  it("returns timeout for AbortError", async () => {
    const abortError = new Error("timeout")
    abortError.name = "AbortError"
    ;(global.fetch as jest.Mock).mockRejectedValue(abortError)

    await expect(validateLinkWithReason("https://example.com/jobs/1")).resolves.toEqual({
      isValid: false,
      reason: "timeout",
    })
  })

  it("returns network-error for generic failures", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error("boom"))

    await expect(validateLinkWithReason("https://example.com/jobs/1")).resolves.toEqual({
      isValid: false,
      reason: "network-error",
    })
  })

  it("isLinkStillValid unwraps result", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      text: async () => "html",
    })

    await expect(isLinkStillValid("https://example.com/jobs/1")).resolves.toBe(true)
  })
})
