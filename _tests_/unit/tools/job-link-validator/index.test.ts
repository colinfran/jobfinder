/** @jest-environment node */
import { loadEnvIfNeeded, validateJobs } from "../../../../tools/job-link-validator/index"

describe("tools/job-link-validator", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("returns false when CRON_SECRET is missing", async () => {
    const logger = { log: jest.fn(), error: jest.fn() }

    const ok = await validateJobs({
      env: { APP_URL: "https://app.example.com" },
      validators: { ashby: jest.fn(), workday: jest.fn(), gem: jest.fn() },
      logger,
    })

    expect(ok).toBe(false)
    expect(logger.error).toHaveBeenCalledWith("❌ CRON_SECRET environment variable is not set")
  })

  it("runs both validators and returns true on success", async () => {
    const ashby = jest.fn().mockResolvedValue(undefined)
    const workday = jest.fn().mockResolvedValue(undefined)
    const gem = jest.fn().mockResolvedValue(undefined)
    const logger = { log: jest.fn(), error: jest.fn() }

    const ok = await validateJobs({
      env: { APP_URL: "https://app.example.com", CRON_SECRET: "secret" },
      validators: { ashby, workday, gem },
      logger,
    })

    expect(ok).toBe(true)
    expect(ashby).toHaveBeenCalledWith("https://app.example.com", "secret")
    expect(workday).toHaveBeenCalledWith("https://app.example.com", "secret")
    expect(gem).toHaveBeenCalledWith("https://app.example.com", "secret")
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining("All validations complete"))
  })

  it("returns false when a validator throws", async () => {
    const ashby = jest.fn().mockRejectedValue(new Error("boom"))
    const workday = jest.fn()
    const gem = jest.fn()
    const logger = { log: jest.fn(), error: jest.fn() }

    const ok = await validateJobs({
      env: { APP_URL: "https://app.example.com", CRON_SECRET: "secret" },
      validators: { ashby, workday, gem },
      logger,
    })

    expect(ok).toBe(false)
    expect(workday).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith("❌ Validation failed:", expect.any(Error))
  })

  it("loads .env when not running in GitHub Actions", () => {
    const spy = jest
      .spyOn(process, "loadEnvFile")
      .mockReturnValue(undefined as unknown as NodeJS.ProcessEnv)

    loadEnvIfNeeded({})

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("does not load .env when running in GitHub Actions", () => {
    const spy = jest
      .spyOn(process, "loadEnvFile")
      .mockReturnValue(undefined as unknown as NodeJS.ProcessEnv)

    loadEnvIfNeeded({ GITHUB_ACTIONS: "true" })

    expect(spy).not.toHaveBeenCalled()
  })
})
