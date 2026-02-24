import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TriggerButton } from "@/components/trigger-button"
import { formatTimeRemaining, getNextCronRun } from "@/lib/utils"

const refreshMock = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}))

jest.mock("@/lib/utils", () => ({
  getNextCronRun: jest.fn(),
  formatTimeRemaining: jest.fn(),
}))

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock("@/components/ui/spinner", () => ({
  Spinner: () => <span data-testid="spinner" />,
}))

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className} data-testid="skeleton" />
  ),
}))

describe("TriggerButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    ;(global.fetch as unknown as jest.Mock) = jest.fn()
    jest.mocked(getNextCronRun).mockReturnValue(new Date("2026-02-24T12:00:00.000Z"))
    jest.mocked(formatTimeRemaining).mockReturnValue("01m 00s")
  })

  it("shows countdown when trigger secret is missing", () => {
    render(<TriggerButton />)

    expect(screen.getByText("Next search in")).toBeInTheDocument()
    expect(screen.getByText("01m 00s")).toBeInTheDocument()
  })

  it("triggers search and refreshes when secret is present", async () => {
    localStorage.setItem("TRIGGER_SECRET", "abc123")
    ;(global.fetch as unknown as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, jobsInserted: 5 }),
    })

    const user = userEvent.setup()
    render(<TriggerButton />)

    await user.click(screen.getByRole("button", { name: "Search Now" }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/cron/search-jobs", {
        headers: { Authorization: "Bearer abc123" },
      })
    })

    expect(screen.getByText("Searched 5 new jobs")).toBeInTheDocument()
    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it("shows fallback error when fetch throws", async () => {
    localStorage.setItem("TRIGGER_SECRET", "abc123")
    ;(global.fetch as unknown as jest.Mock).mockRejectedValue(new Error("network down"))

    const user = userEvent.setup()
    render(<TriggerButton />)

    await user.click(screen.getByRole("button", { name: "Search Now" }))

    await waitFor(() => {
      expect(screen.getByText("Error triggering search")).toBeInTheDocument()
    })
  })
})
