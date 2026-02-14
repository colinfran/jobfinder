"use client"
import React, { FC, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { HomeIcon, InfoIcon, Loader2, LogOut } from "lucide-react"
import ThemeButton from "./theme-button"
import MenuButton from "./menu-button"
import { usePathname } from "next/navigation"
import { authClient, signOut } from "@/lib/auth/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Skeleton } from "../ui/skeleton"

const HeaderDropdown: FC = () => {
  const pathname = usePathname()

  const { data: session } = authClient.useSession()

  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const onClick = async (): Promise<void> => {
    setLoading(true)
    await signOut(setLoading)
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "UN"

  const isDashboard = pathname === "/dashboard"
  const showSkeleton = isDashboard && !session

  return (
    <div className="flex w-full items-center justify-end gap-8">
      <div className="">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger className="flex cursor-pointer" asChild>
            {showSkeleton ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : session ? (
              <Avatar>
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ) : (
              <MenuButton isOpen={isOpen} />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="flex w-full cursor-pointer flex-row items-center gap-2"
              asChild
            >
              <Link href="/">
                <HomeIcon size={16} />
                <span>Home</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ThemeButton />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex w-full cursor-pointer flex-row items-center gap-2"
              asChild
            >
              <Link href="/about" prefetch>
                <InfoIcon size={16} />
                <span>About</span>
              </Link>
            </DropdownMenuItem>
            {session && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button
                    className="flex w-full flex-row items-center gap-2"
                    type="submit"
                    onClick={onClick}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <LogOut size={16} />
                    )}
                    <span>Sign Out</span>
                  </button>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default HeaderDropdown
