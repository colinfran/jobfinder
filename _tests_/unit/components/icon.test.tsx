import { render, screen } from "@testing-library/react"
import Icon from "@/components/icon"

const useThemeMock = jest.fn()

jest.mock("next-themes", () => ({
  useTheme: () => useThemeMock(),
}))

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

describe("Icon", () => {
  it("uses invert class for light mode", () => {
    useThemeMock.mockReturnValue({ resolvedTheme: "light" })

    render(<Icon />)

    expect(screen.getByAltText("logo")).toHaveClass("invert")
  })

  it("removes invert class for dark mode", () => {
    useThemeMock.mockReturnValue({ resolvedTheme: "dark" })

    render(<Icon size={44} />)

    const image = screen.getByAltText("logo")
    expect(image).not.toHaveClass("invert")
    expect(image).toHaveAttribute("height", "44")
    expect(image).toHaveAttribute("width", "44")
  })
})
