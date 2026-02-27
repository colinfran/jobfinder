import { UIEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  DEFAULT_VIEWPORT_HEIGHT,
  DESKTOP_ESTIMATED_ROW_HEIGHT,
  MOBILE_ESTIMATED_ROW_HEIGHT,
  OVERSCAN_ROWS,
} from "./constants"
import { findFirstOffsetIndex } from "./utils"
import { UseVirtualJobRowsReturn, VirtualJobRowsProps, VisibleRow } from "./types"

export const useVirtualJobRows = ({ jobs }: VirtualJobRowsProps): UseVirtualJobRowsReturn => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT)
  const [measuredHeights, setMeasuredHeights] = useState<Record<number, number>>({})
  const isMobile = useIsMobile()

  const estimatedRowHeight = isMobile ? MOBILE_ESTIMATED_ROW_HEIGHT : DESKTOP_ESTIMATED_ROW_HEIGHT

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return

    const updateHeight = (): void => {
      setViewportHeight(element.clientHeight || DEFAULT_VIEWPORT_HEIGHT)
    }

    updateHeight()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight)
      return () => window.removeEventListener("resize", updateHeight)
    }

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const validIds = new Set(jobs.map((job) => job.id))
    setMeasuredHeights((previous) => {
      const next = Object.fromEntries(
        Object.entries(previous).filter(([jobId]) => validIds.has(Number(jobId))),
      )
      return Object.keys(next).length === Object.keys(previous).length ? previous : next
    })
  }, [jobs])

  const { offsets, totalHeight } = useMemo(() => {
    const nextOffsets = new Array<number>(jobs.length + 1)
    nextOffsets[0] = 0

    for (let index = 0; index < jobs.length; index += 1) {
      const jobId = jobs[index].id
      const rowHeight = measuredHeights[jobId] ?? estimatedRowHeight
      nextOffsets[index + 1] = nextOffsets[index] + rowHeight
    }

    return {
      offsets: nextOffsets,
      totalHeight: nextOffsets[jobs.length] ?? 0,
    }
  }, [estimatedRowHeight, jobs, measuredHeights])

  const { startIndex, endIndex } = useMemo(() => {
    if (jobs.length === 0) {
      return { startIndex: 0, endIndex: -1 }
    }

    const visibleStart = findFirstOffsetIndex(offsets, scrollTop)
    const visibleEnd = findFirstOffsetIndex(offsets, scrollTop + viewportHeight)

    return {
      startIndex: Math.max(0, visibleStart - OVERSCAN_ROWS),
      endIndex: Math.min(jobs.length - 1, visibleEnd + OVERSCAN_ROWS),
    }
  }, [jobs.length, offsets, scrollTop, viewportHeight])

  const visibleRows = useMemo<VisibleRow[]>(() => {
    if (endIndex < startIndex) return []

    return jobs.slice(startIndex, endIndex + 1).map((job, relativeIndex) => {
      const absoluteIndex = startIndex + relativeIndex
      return {
        job,
        top: offsets[absoluteIndex],
      }
    })
  }, [endIndex, jobs, offsets, startIndex])

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  const handleHeightChange = useCallback((jobId: number, height: number): void => {
    setMeasuredHeights((previous) => {
      if (previous[jobId] === height) return previous
      return { ...previous, [jobId]: height }
    })
  }, [])

  return {
    handleHeightChange,
    handleScroll,
    totalHeight,
    viewportRef,
    visibleRows,
  }
}
