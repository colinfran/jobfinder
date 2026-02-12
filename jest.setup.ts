import "@testing-library/jest-dom"

jest.mock("nanostores", () => ({
  atom: jest.fn(),
  readonlyType: jest.fn(),
}))

jest.mock("better-auth/react", () => ({
  createAuthClient: () => ({
    useSession: jest.fn(() => ({ data: null })),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}))

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver
