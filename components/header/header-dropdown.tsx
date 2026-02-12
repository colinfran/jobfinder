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
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

const HeaderDropdown: FC = () => {
  const router = useRouter()

  const { data: session } = authClient.useSession()

  const [isOpen, setIsOpen] = useState(false)

  const [loading, setLoading] = useState(false)

  const onClick = async (): Promise<void> => {
    setLoading(true)
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setLoading(false)
          router.push("/")
        },
        onError: () => {
          setLoading(false)
        },
      },
    })
  }

  return (
    <div className="flex w-full items-center justify-end gap-8">
      <div className="">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger className="flex cursor-pointer" asChild>
            <MenuButton isOpen={isOpen} />
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
