import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Page from "@/app/(routes)/page"
import { authenticate } from "@/lib/auth/auth-client"

jest.mock("@/lib/auth/auth-client", () => ({
  authenticate: jest.fn(),
}))

jest.mock("@/components/auth-error", () => ({
  AuthError: () => <div data-testid="auth-error" />,
}))

describe("home page", () => {
  it("renders sign-in content", () => {
    render(<Page />)

    expect(screen.getByRole("heading", { name: "JobFinder" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in with github/i })).toBeInTheDocument()
  })

  it("calls authenticate when sign in is clicked", async () => {
    const user = userEvent.setup()
    render(<Page />)

    await user.click(screen.getByRole("button", { name: /sign in with github/i }))

    expect(authenticate).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: /sign in with github/i })).toBeDisabled()
  })
})
