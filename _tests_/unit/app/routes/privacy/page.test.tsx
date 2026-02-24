import { render, screen } from "@testing-library/react"
import PrivacyPage from "@/app/(routes)/privacy/page"

type AsyncPage = () => Promise<JSX.Element>

describe("privacy page", () => {
  it("renders privacy content", async () => {
    render(await (PrivacyPage as AsyncPage)())

    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Back to Home" })).toBeInTheDocument()
    expect(screen.getByText("hello@colinfran.com")).toBeInTheDocument()
  })
})
