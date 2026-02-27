"use client"

import { FC } from "react"
import { MeasuredRow } from "./measured-row"
import { VirtualJobRowsProps } from "./types"
import { useVirtualJobRows } from "./use-virtual-job-rows"
import { VirtualJobRowsSkeleton } from "./virtual-job-rows-skeleton"

export const VirtualJobRows: FC<VirtualJobRowsProps> = ({ jobs }) => {
  const { handleHeightChange, handleScroll, isReady, totalHeight, viewportRef, visibleRows } =
    useVirtualJobRows({ jobs })

  return (
    <div className="relative min-h-0 flex-1">
      <div
        className={`h-full min-h-0 overflow-auto transition-opacity ${isReady ? "opacity-100" : "opacity-0"}`}
        ref={viewportRef}
        onScroll={handleScroll}
      >
        <div className="relative w-full" style={{ height: totalHeight }}>
          {visibleRows.map(({ job, top }) => (
            <MeasuredRow job={job} key={job.id} top={top} onHeightChange={handleHeightChange} />
          ))}
        </div>
      </div>
      {!isReady && (
        <div className="absolute inset-0">
          <VirtualJobRowsSkeleton />
        </div>
      )}
    </div>
  )
}
