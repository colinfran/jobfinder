"use client"

import React, { FC } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenuItem } from "../ui/dropdown-menu"

const ThemeButton: FC = () => {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <DropdownMenuItem
      className="gap-2 cursor-pointer"
      data-testid="theme-button"
      onClick={(e) => {
        e.preventDefault()
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }}
    >
      {resolvedTheme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      Theme
    </DropdownMenuItem>
  )
}

export default ThemeButton
