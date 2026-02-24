let authenticate: () => Promise<void>
let signOut: (setLoading: (loading: boolean) => void) => Promise<void>
let createAuthClientMock: jest.Mock
let signInSocialMock: jest.Mock
let signOutMock: jest.Mock

describe("lib/auth/auth-client", () => {
  beforeEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()

    signInSocialMock = jest.fn()
    signOutMock = jest.fn()

    jest.doMock("better-auth/react", () => ({
      createAuthClient: jest.fn(() => ({
        signIn: { social: signInSocialMock },
        signOut: signOutMock,
      })),
    }))

    const authClientModule = await import("@/lib/auth/auth-client")
    const betterAuthReactModule = await import("better-auth/react")

    authenticate = authClientModule.authenticate
    signOut = authClientModule.signOut
    createAuthClientMock = betterAuthReactModule.createAuthClient as jest.Mock
  })

  it("creates auth client with NEXT_PUBLIC_BETTER_AUTH_URL", () => {
    expect(createAuthClientMock).toHaveBeenCalledWith({
      baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    })
  })

  it("authenticate uses github social sign in config", async () => {
    await authenticate()

    expect(signInSocialMock).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: "/dashboard",
      errorCallbackURL: "/",
      newUserCallbackURL: "/dashboard",
    })
  })

  it("authenticate swallows sign-in errors", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)
    signInSocialMock.mockRejectedValueOnce(new Error("oauth failed"))

    await expect(authenticate()).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it("signOut passes success and error callbacks to auth client", async () => {
    const setLoading = jest.fn()
    let fetchOptionsArg: {
      onSuccess: () => void
      onError: () => void
    } | null = null
    signOutMock.mockImplementation(async ({ fetchOptions }) => {
      fetchOptionsArg = fetchOptions
    })

    await signOut(setLoading)

    expect(fetchOptionsArg).toEqual({
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    })
    expect(setLoading).not.toHaveBeenCalled()
  })

  it("signOut handles error callback", async () => {
    const setLoading = jest.fn()

    signOutMock.mockImplementation(async ({ fetchOptions }) => {
      fetchOptions.onError()
    })

    await signOut(setLoading)

    expect(setLoading).toHaveBeenCalledWith(false)
  })
})
