"use client"
import React, { FC, useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Bell, DollarSignIcon, HomeIcon, InfoIcon } from "lucide-react"
import ThemeButton from "./theme-button"
import MenuButton from "./menu-button"

const HeaderDropdown: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  return (
    <div className="flex w-full items-center justify-end gap-8">
      <div className="">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger className="flex" asChild>
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
              <Link href="/about">
                <InfoIcon size={16} />
                <span>About</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default HeaderDropdown
