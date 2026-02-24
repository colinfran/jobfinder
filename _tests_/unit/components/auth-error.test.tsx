import { render, screen } from "@testing-library/react"
import { AuthError } from "@/components/auth-error"

const replaceMock = jest.fn()
const getMock = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => ({ get: getMock }),
}))

describe("AuthError", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders nothing when there is no error query", () => {
    getMock.mockReturnValue(null)

    const { container } = render(<AuthError />)

    expect(container).toBeEmptyDOMElement()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it("renders access denied message and clears query params", () => {
    getMock.mockImplementation((key: string) => (key === "error" ? "access_denied" : null))

    render(<AuthError />)

    expect(screen.getByText("You denied access.")).toBeInTheDocument()
    expect(replaceMock).toHaveBeenCalledWith("/", { scroll: false })
  })

  it("renders decoded error_description message", () => {
    getMock.mockImplementation((key: string) => {
      if (key === "error") return "oauth_error"
      if (key === "error_description") return "Invalid+request%3A+bad+scope"
      return null
    })

    render(<AuthError />)

    expect(screen.getByText("Invalid request: bad scope")).toBeInTheDocument()
  })
})
