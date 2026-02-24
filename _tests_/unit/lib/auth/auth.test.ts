/** @jest-environment node */

describe("lib/auth/auth", () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetModules()
    jest.clearAllMocks()
  })

  it("configures github provider and db adapter", async () => {
    process.env.E2E_AUTH_BYPASS = "false"
    process.env.GITHUB_CLIENT_ID = "gh-id"
    process.env.GITHUB_CLIENT_SECRET = "gh-secret"

    const betterAuthMock = jest.fn((config) => ({ config }))
    const drizzleAdapterMock = jest.fn(() => "adapter")

    jest.doMock("better-auth", () => ({ betterAuth: betterAuthMock }))
    jest.doMock("better-auth/adapters/drizzle", () => ({ drizzleAdapter: drizzleAdapterMock }))
    jest.doMock("@/lib/db", () => ({ db: "db-instance" }))

    const { auth } = await import("@/lib/auth/auth")

    expect(drizzleAdapterMock).toHaveBeenCalledWith("db-instance", { provider: "pg" })
    expect(betterAuthMock).toHaveBeenCalledTimes(1)

    const config = (auth as { config: Record<string, unknown> }).config
    expect(config.socialProviders).toEqual({
      github: {
        clientId: "gh-id",
        clientSecret: "gh-secret",
      },
    })
    expect(config.emailAndPassword).toBeUndefined()
  })

  it("enables email/password auth in e2e mode", async () => {
    process.env.E2E_AUTH_BYPASS = "true"

    const betterAuthMock = jest.fn((config) => ({ config }))

    jest.doMock("better-auth", () => ({ betterAuth: betterAuthMock }))
    jest.doMock("better-auth/adapters/drizzle", () => ({ drizzleAdapter: () => "adapter" }))
    jest.doMock("@/lib/db", () => ({ db: "db-instance" }))

    const { auth } = await import("@/lib/auth/auth")

    const config = (auth as { config: Record<string, unknown> }).config
    expect(config.emailAndPassword).toEqual({
      enabled: true,
      requireEmailVerification: false,
    })
  })
})
