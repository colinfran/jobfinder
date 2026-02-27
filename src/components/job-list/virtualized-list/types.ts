import type { RefObject, UIEvent } from "react"
import { JobWithStatus } from "@/hooks/use-job-list"

export type VirtualJobRowsProps = {
  jobs: JobWithStatus[]
}

export type MeasuredRowProps = {
  job: JobWithStatus
  top: number
  onHeightChange: (jobId: number, height: number) => void
}

export type VisibleRow = {
  job: JobWithStatus
  top: number
}

export type UseVirtualJobRowsReturn = {
  handleHeightChange: (jobId: number, height: number) => void
  handleScroll: (event: UIEvent<HTMLDivElement>) => void
  totalHeight: number
  viewportRef: RefObject<HTMLDivElement | null>
  visibleRows: VisibleRow[]
}
