"use client"
import React, { FC, useEffect, useState } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

type Props = {
  size?: number
}

const Icon: FC<Props> = ({ size = 32 }) => {
  const { resolvedTheme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setIsDark(true)
    } else {
      setIsDark(false)
    }
  }, [resolvedTheme])

  return (
    <Image
      alt="logo"
      className={isDark ? "" : "invert"}
      height={size}
      src={"/logo.png"}
      width={size}
      suppressHydrationWarning
    />
  )
}

export default Icon
