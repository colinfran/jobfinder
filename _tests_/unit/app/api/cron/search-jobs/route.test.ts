/** @jest-environment node */
import { GET } from "@/app/api/cron/search-jobs/route"
import { processSearchQuery } from "@/app/api/cron/search-jobs/serper-service"

jest.mock("@/lib/config/search-queries", () => ({
  SEARCH_QUERIES: ["q1", "q2"],
}))

jest.mock("@/app/api/cron/search-jobs/serper-service", () => ({
  processSearchQuery: jest.fn(),
}))

describe("api/cron/search-jobs GET", () => {
  const originalCronSecret = process.env.CRON_SECRET

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret
    jest.clearAllMocks()
  })

  it("returns 401 when authorization header is invalid", async () => {
    process.env.CRON_SECRET = "secret"

    const response = await GET(new Request("http://localhost/api/cron/search-jobs"))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" })
    expect(processSearchQuery).not.toHaveBeenCalled()
  })

  it("processes queries and returns aggregated results", async () => {
    process.env.CRON_SECRET = "secret"

    const mockedProcessSearchQuery = jest.mocked(processSearchQuery)
    mockedProcessSearchQuery
      .mockResolvedValueOnce({ inserted: 2, errors: [] })
      .mockResolvedValueOnce({ inserted: 1, errors: ["bad parse"] })

    const response = await GET(
      new Request("http://localhost/api/cron/search-jobs", {
        headers: { authorization: "Bearer secret" },
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      queriesProcessed: 2,
      jobsInserted: 3,
      errors: ["bad parse"],
    })
    expect(processSearchQuery).toHaveBeenCalledTimes(2)
    expect(processSearchQuery).toHaveBeenNthCalledWith(1, "q1")
    expect(processSearchQuery).toHaveBeenNthCalledWith(2, "q2")
  })
})
