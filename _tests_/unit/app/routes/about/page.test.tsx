import { render, screen } from "@testing-library/react"
import AboutPage from "@/app/(routes)/about/page"

type AsyncPage = () => Promise<JSX.Element>

describe("about page", () => {
  it("renders about content", async () => {
    render(await (AboutPage as AsyncPage)())

    expect(screen.getByRole("heading", { name: "JobFinder" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Built by Colin Franceschini" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Terms of Service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeInTheDocument()
  })
})
