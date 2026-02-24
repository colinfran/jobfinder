import { render, screen } from "@testing-library/react"
import TermsPage from "@/app/(routes)/terms/page"

type AsyncPage = () => Promise<JSX.Element>

describe("terms page", () => {
  it("renders terms content", async () => {
    render(await (TermsPage as AsyncPage)())

    expect(screen.getByRole("heading", { name: "Terms and Conditions" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Back to Home" })).toBeInTheDocument()
  })
})
