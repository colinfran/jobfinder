/** @jest-environment node */
import { GET } from "@/app/api/workday/get/route"
import { db } from "@/lib/db"

jest.mock("@/lib/db", () => ({
  db: {
    select: jest.fn(),
  },
}))

describe("api/workday/get GET", () => {
  const originalCronSecret = process.env.CRON_SECRET

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret
    jest.clearAllMocks()
  })

  it("returns 401 when authorization header is invalid", async () => {
    process.env.CRON_SECRET = "secret"

    const response = await GET(new Request("http://localhost/api/workday/get"))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" })
  })

  it("returns workday jobs on success", async () => {
    process.env.CRON_SECRET = "secret"

    const whereMock = jest
      .fn()
      .mockResolvedValue([{ id: 7, title: "Role", link: "https://acme.myworkdayjobs.com/x/7" }])
    const fromMock = jest.fn().mockReturnValue({ where: whereMock })
    jest.mocked(db.select).mockReturnValue({ from: fromMock } as never)

    const response = await GET(
      new Request("http://localhost/api/workday/get", {
        headers: { authorization: "Bearer secret" },
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      jobs: [{ id: 7, title: "Role", link: "https://acme.myworkdayjobs.com/x/7" }],
    })
  })

  it("returns 500 when db query fails", async () => {
    process.env.CRON_SECRET = "secret"

    const whereMock = jest.fn().mockRejectedValue(new Error("db down"))
    const fromMock = jest.fn().mockReturnValue({ where: whereMock })
    jest.mocked(db.select).mockReturnValue({ from: fromMock } as never)

    const response = await GET(
      new Request("http://localhost/api/workday/get", {
        headers: { authorization: "Bearer secret" },
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({ success: false, error: "db down" })
  })
})
