"use client"

import type React from "react"

import type { FC } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"

type HamburgerMenuProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
}

const MenuButton: FC<HamburgerMenuProps> = ({ className, isOpen = false, ...props }) => {
  return (
    <Button
      aria-expanded={isOpen}
      aria-label="Toggle menu"
      className={cn("relative h-10 w-10", className)}
      size="icon"
      variant="outline"
      {...props}
    >
      <Menu
        className={cn(
          "absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out",
          isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <X
        className={cn(
          "absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out",
          isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </Button>
  )
}

export default MenuButton
