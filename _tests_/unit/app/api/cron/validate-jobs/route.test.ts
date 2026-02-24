/** @jest-environment node */
import { GET } from "@/app/api/cron/validate-jobs/route"
import { db } from "@/lib/db"
import { validateJobLinks } from "@/app/api/cron/validate-jobs/validate-job-link"

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
  },
}))

jest.mock("@/app/api/cron/validate-jobs/validate-job-link", () => ({
  validateJobLinks: jest.fn(),
}))

describe("api/cron/validate-jobs GET", () => {
  const originalCronSecret = process.env.CRON_SECRET

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret
    jest.clearAllMocks()
  })

  it("returns 401 when authorization header is invalid", async () => {
    process.env.CRON_SECRET = "secret"

    const response = await GET(new Request("http://localhost/api/cron/validate-jobs"))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" })
  })

  it("returns validation summary on success", async () => {
    process.env.CRON_SECRET = "secret"

    const fromMock = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
    jest.mocked(db.select).mockReturnValue({ from: fromMock } as never)
    jest.mocked(validateJobLinks).mockResolvedValue({
      removed: 2,
      duplicatesRemoved: 1,
      errors: [],
    })

    const response = await GET(
      new Request("http://localhost/api/cron/validate-jobs", {
        headers: { authorization: "Bearer secret" },
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      jobsChecked: 3,
      jobsRemoved: 2,
      duplicatesRemoved: 1,
    })
  })

  it("returns 500 when validation throws", async () => {
    process.env.CRON_SECRET = "secret"

    const fromMock = jest.fn().mockResolvedValue([{ id: 1 }])
    jest.mocked(db.select).mockReturnValue({ from: fromMock } as never)
    jest.mocked(validateJobLinks).mockRejectedValue(new Error("boom"))

    const response = await GET(
      new Request("http://localhost/api/cron/validate-jobs", {
        headers: { authorization: "Bearer secret" },
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "boom",
    })
  })
})
