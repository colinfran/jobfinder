import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { JobRow } from "@/components/job-list/job-row"

const handleApplyToggleMock = jest.fn()
const handleMarkNotRelevantMock = jest.fn()

jest.mock("@/providers/job-list-provider", () => ({
  useJobListContext: () => ({
    handleApplyToggle: handleApplyToggleMock,
    handleMarkNotRelevant: handleMarkNotRelevantMock,
  }),
}))

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

const baseJob = {
  id: 1,
  title: "Frontend Engineer",
  company: "Acme",
  link: "https://jobs.example.com/1",
  source: "lever.co",
  createdAt: new Date("2026-02-24T12:00:00.000Z"),
  applied: false,
  notRelevant: false,
  topic: "software",
  snippet: null,
  searchQuery: null,
}

describe("JobRow", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("toggles apply when title link is clicked for new job", async () => {
    const user = userEvent.setup()
    render(<JobRow job={baseJob} />)

    await user.click(screen.getByRole("link", { name: "Frontend Engineer" }))

    expect(handleApplyToggleMock).toHaveBeenCalledWith(baseJob)
  })

  it("calls mark-not-relevant action", async () => {
    const user = userEvent.setup()
    render(<JobRow job={baseJob} />)

    await user.click(screen.getByRole("button", { name: "Mark as Not Relevant" }))

    expect(handleMarkNotRelevantMock).toHaveBeenCalledWith(baseJob)
  })

  it("disables status toggle when job is marked not relevant", () => {
    render(<JobRow job={{ ...baseJob, notRelevant: true }} />)

    expect(screen.getByRole("button", { name: /not relevant/i })).toBeDisabled()
  })
})
