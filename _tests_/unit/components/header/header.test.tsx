import { render, screen } from "@testing-library/react"
import Header from "@/components/header/header"

jest.mock("@/components/header/header-dropdown", () => ({
  __esModule: true,
  default: () => <div data-testid="header-dropdown" />,
}))

jest.mock("@/components/icon", () => ({
  __esModule: true,
  default: () => <div data-testid="icon" />,
}))

describe("Header", () => {
  it("renders brand link and dropdown", async () => {
    render(await Header({}))

    expect(screen.getByRole("link", { name: /jobfinder/i })).toHaveAttribute("href", "/")
    expect(screen.getByTestId("icon")).toBeInTheDocument()
    expect(screen.getByTestId("header-dropdown")).toBeInTheDocument()
  })
})
