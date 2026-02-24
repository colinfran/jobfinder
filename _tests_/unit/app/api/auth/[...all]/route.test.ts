/** @jest-environment node */
const mockGet = jest.fn(async () => new Response("ok-get"))
const mockPost = jest.fn(async () => new Response("ok-post"))
const toNextJsHandlerMock = jest.fn(() => ({ GET: mockGet, POST: mockPost }))

jest.mock("better-auth/next-js", () => ({
  toNextJsHandler: toNextJsHandlerMock,
}))

jest.mock("@/lib/auth/auth", () => ({
  auth: { kind: "mock-auth" },
}))

describe("api/auth/[...all] route wiring", () => {
  it("uses toNextJsHandler(auth) and exports GET/POST handlers", async () => {
    const route = await import("@/app/api/auth/[...all]/route")

    expect(toNextJsHandlerMock).toHaveBeenCalledTimes(1)
    const [arg] = toNextJsHandlerMock.mock.calls[0] as unknown as [object]
    expect(arg).toEqual({ kind: "mock-auth" })

    const getResponse = await route.GET(new Request("http://localhost/api/auth/test"))
    const postResponse = await route.POST(
      new Request("http://localhost/api/auth/test", { method: "POST" }),
    )

    expect(getResponse.status).toBe(200)
    expect(postResponse.status).toBe(200)
    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockPost).toHaveBeenCalledTimes(1)
  })
})
