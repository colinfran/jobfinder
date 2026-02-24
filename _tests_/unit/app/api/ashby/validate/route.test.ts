/** @jest-environment node */
import { POST } from "@/app/api/ashby/validate/route"
import { db } from "@/lib/db"

jest.mock("@/lib/db", () => ({
  db: {
    delete: jest.fn(),
  },
}))

describe("api/ashby/validate POST", () => {
  const originalCronSecret = process.env.CRON_SECRET

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret
    jest.clearAllMocks()
  })

  it("returns 401 when authorization header is invalid", async () => {
    process.env.CRON_SECRET = "secret"

    const response = await POST(
      new Request("http://localhost/api/ashby/validate", { method: "POST" }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" })
  })

  it("returns 400 when invalidJobIds is missing or empty", async () => {
    process.env.CRON_SECRET = "secret"

    const response = await POST(
      new Request("http://localhost/api/ashby/validate", {
        method: "POST",
        headers: { authorization: "Bearer secret", "content-type": "application/json" },
        body: JSON.stringify({ invalidJobIds: [] }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "invalidJobIds must be a non-empty array",
    })
  })

  it("deletes invalid jobs and returns summary", async () => {
    process.env.CRON_SECRET = "secret"

    const whereMock = jest.fn().mockResolvedValue(undefined)
    jest.mocked(db.delete).mockReturnValue({ where: whereMock } as never)

    const response = await POST(
      new Request("http://localhost/api/ashby/validate", {
        method: "POST",
        headers: { authorization: "Bearer secret", "content-type": "application/json" },
        body: JSON.stringify({ invalidJobIds: [1, 2] }),
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      jobsRemoved: 2,
    })
  })
})
