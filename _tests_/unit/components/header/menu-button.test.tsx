import { render, screen } from "@testing-library/react"
import MenuButton from "@/components/header/menu-button"

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

describe("MenuButton", () => {
  it("renders toggle button with closed state", () => {
    render(<MenuButton isOpen={false} />)

    const button = screen.getByRole("button", { name: "Toggle menu" })
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button.querySelectorAll("svg")).toHaveLength(2)
  })

  it("renders toggle button with open state", () => {
    render(<MenuButton isOpen />)

    expect(screen.getByRole("button", { name: "Toggle menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    )
  })
})
