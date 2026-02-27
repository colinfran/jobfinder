import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { JobList } from "@/components/job-list/job-list"

const setFilterMock = jest.fn()
const setSearchMock = jest.fn()
const handleTopicChangeMock = jest.fn()

const defaultContext = {
  filter: "all",
  setFilter: setFilterMock,
  search: "",
  setSearch: setSearchMock,
  topic: "software",
  filteredJobs: [],
  topicJobs: [],
  topicSources: new Set<string>(),
  counts: {
    all: 0,
    new: 0,
    applied: 0,
    not_relevant: 0,
  },
  topics: ["software", "finance"],
  jobs: [],
  handleTopicChange: handleTopicChangeMock,
}

const useJobListContextMock = jest.fn(() => defaultContext)

jest.mock("@/providers/job-list-provider", () => ({
  useJobListContext: () => useJobListContextMock(),
}))

jest.mock("@/components/job-list/job-row", () => ({
  JobRow: ({ job }: { job: { title: string } }) => <div>{job.title}</div>,
}))

jest.mock("@/components/job-list/virtualized-list", () => ({
  VirtualJobRows: ({ jobs }: { jobs: Array<{ id: number; title: string }> }) => (
    <div>
      {jobs.map((job) => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  ),
}))

jest.mock("@/components/ui/input-group", () => ({
  InputGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  InputGroupAddon: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  InputGroupInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ScrollBar: () => null,
}))

describe("JobList", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useJobListContextMock.mockReturnValue(defaultContext)
  })

  it("renders empty-state message when there are no jobs", () => {
    render(<JobList />)

    expect(
      screen.getByText(
        "No jobs found yet. The cron job runs every 6 hours. Please check back soon!",
      ),
    ).toBeInTheDocument()
  })

  it("renders job rows when filtered jobs exist", () => {
    useJobListContextMock.mockReturnValue({
      ...defaultContext,
      jobs: [{ id: 1 }],
      filteredJobs: [{ id: 1, title: "Backend Engineer" }],
      topicJobs: [{ id: 1 }],
      topicSources: new Set(["lever"]),
      counts: { all: 1, new: 1, applied: 0, not_relevant: 0 },
    })

    render(<JobList />)

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument()
    expect(screen.getByText("1 jobs found across 1 sources")).toBeInTheDocument()
  })

  it("calls topic, tab, and search handlers", async () => {
    const user = userEvent.setup()
    useJobListContextMock.mockReturnValue({
      ...defaultContext,
      jobs: [{ id: 1 }],
      filteredJobs: [{ id: 1, title: "Backend Engineer" }],
      topicJobs: [{ id: 1 }],
      topicSources: new Set(["lever"]),
      counts: { all: 1, new: 1, applied: 0, not_relevant: 0 },
    })

    render(<JobList />)

    await user.click(screen.getByRole("button", { name: "Finance" }))
    expect(handleTopicChangeMock).toHaveBeenCalledWith("finance")

    await user.click(screen.getByRole("button", { name: /Applied/ }))
    expect(setFilterMock).toHaveBeenCalledWith("applied")

    await user.type(screen.getByPlaceholderText("Search jobs..."), "staff")
    expect(setSearchMock).toHaveBeenCalled()
  })
})
