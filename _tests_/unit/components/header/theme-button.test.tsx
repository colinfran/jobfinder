import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ThemeButton from "@/components/header/theme-button"

const setThemeMock = jest.fn()
const useThemeMock = jest.fn()

jest.mock("next-themes", () => ({
  useTheme: () => useThemeMock(),
}))

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuItem: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

describe("ThemeButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("switches dark to light", async () => {
    useThemeMock.mockReturnValue({ resolvedTheme: "dark", setTheme: setThemeMock })

    const user = userEvent.setup()
    render(<ThemeButton />)

    await user.click(screen.getByTestId("theme-button"))

    expect(setThemeMock).toHaveBeenCalledWith("light")
  })

  it("switches light to dark", async () => {
    useThemeMock.mockReturnValue({ resolvedTheme: "light", setTheme: setThemeMock })

    const user = userEvent.setup()
    render(<ThemeButton />)

    await user.click(screen.getByTestId("theme-button"))

    expect(setThemeMock).toHaveBeenCalledWith("dark")
  })
})
