import { insertJob } from "@/lib/db/insert-job"
import { db } from "@/lib/db"

jest.mock("@/lib/db", () => ({
  db: {
    insert: jest.fn(),
  },
}))

jest.mock("@/lib/db/schema", () => ({
  jobs: {
    link: "link",
  },
}))

describe("lib/db/insert-job", () => {
  const params = {
    title: "Software Engineer",
    company: "Acme",
    link: "https://jobs.example.com/1",
    snippet: "great role",
    source: "lever.co",
    searchQuery: "site:lever.co software",
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns success when insert returns a row", async () => {
    const returningMock = jest.fn().mockResolvedValue([{ id: 1 }])
    const onConflictDoNothingMock = jest.fn(() => ({ returning: returningMock }))
    const valuesMock = jest.fn(() => ({ onConflictDoNothing: onConflictDoNothingMock }))
    jest.mocked(db.insert).mockReturnValue({ values: valuesMock } as never)

    await expect(insertJob(params)).resolves.toEqual({ success: true, alreadyExists: false })
  })

  it("returns alreadyExists when insert returns no rows", async () => {
    const returningMock = jest.fn().mockResolvedValue([])
    const onConflictDoNothingMock = jest.fn(() => ({ returning: returningMock }))
    const valuesMock = jest.fn(() => ({ onConflictDoNothing: onConflictDoNothingMock }))
    jest.mocked(db.insert).mockReturnValue({ values: valuesMock } as never)

    await expect(insertJob(params)).resolves.toEqual({ success: true, alreadyExists: true })
  })

  it("returns failure when insert throws", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)

    jest.mocked(db.insert).mockImplementation(() => {
      throw new Error("db failed")
    })

    await expect(insertJob(params)).resolves.toEqual({ success: false, alreadyExists: false })
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})
