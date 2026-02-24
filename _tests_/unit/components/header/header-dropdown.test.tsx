import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import HeaderDropdown from "@/components/header/header-dropdown"

const usePathnameMock = jest.fn()
const useSessionMock = jest.fn()
const signOutMock = jest.fn()

jest.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}))

jest.mock("@/lib/auth/auth-client", () => ({
  authClient: {
    useSession: () => useSessionMock(),
  },
  signOut: (...args: unknown[]) => signOutMock(...args),
}))

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    asChild,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) =>
    asChild ? <>{children}</> : <div {...props}>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}))

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  // eslint-disable-next-line @next/next/no-img-element
  AvatarImage: ({ src }: { src?: string }) => <img alt="avatar" src={src} />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}))

jest.mock("@/components/header/menu-button", () => ({
  __esModule: true,
  default: () => <button type="button">MenuButton</button>,
}))

jest.mock("@/components/header/theme-button", () => ({
  __esModule: true,
  default: () => <button type="button">Theme</button>,
}))

describe("HeaderDropdown", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows skeleton on dashboard while session is loading", () => {
    usePathnameMock.mockReturnValue("/dashboard")
    useSessionMock.mockReturnValue({ data: null })

    render(<HeaderDropdown />)

    expect(screen.getByTestId("skeleton")).toBeInTheDocument()
  })

  it("shows menu button when no session on non-dashboard routes", () => {
    usePathnameMock.mockReturnValue("/")
    useSessionMock.mockReturnValue({ data: null })

    render(<HeaderDropdown />)

    expect(screen.getByRole("button", { name: "MenuButton" })).toBeInTheDocument()
  })

  it("shows avatar initials and handles sign out", async () => {
    usePathnameMock.mockReturnValue("/dashboard")
    useSessionMock.mockReturnValue({
      data: { user: { name: "Colin Franceschini", image: "https://avatar.example" } },
    })

    const user = userEvent.setup()
    render(<HeaderDropdown />)

    expect(screen.getByText("CF")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /sign out/i }))

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledTimes(1)
    })
  })
})
