"use client"

import { FC, useEffect, useRef } from "react"
import { JobRow } from "@/components/job-list/job-row"
import { MeasuredRowProps } from "./types"

export const MeasuredRow: FC<MeasuredRowProps> = ({ job, top, onHeightChange }) => {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = rowRef.current
    if (!element) return

    const measure = (): void => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height)
      if (nextHeight > 0) {
        onHeightChange(job.id, nextHeight)
      }
    }

    measure()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure)
      return () => window.removeEventListener("resize", measure)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => observer.disconnect()
  }, [job.id, onHeightChange])

  return (
    <div className="absolute inset-x-0 border-b border-border" ref={rowRef} style={{ top }}>
      <JobRow job={job} />
    </div>
  )
}
