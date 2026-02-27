"use client"

import { FC } from "react"
import { MeasuredRow } from "./measured-row"
import { VirtualJobRowsProps } from "./types"
import { useVirtualJobRows } from "./use-virtual-job-rows"

export const VirtualJobRows: FC<VirtualJobRowsProps> = ({ jobs }) => {
  const { handleHeightChange, handleScroll, totalHeight, viewportRef, visibleRows } =
    useVirtualJobRows({ jobs })

  return (
    <div className="min-h-0 flex-1 overflow-auto" ref={viewportRef} onScroll={handleScroll}>
      <div className="relative w-full" style={{ height: totalHeight }}>
        {visibleRows.map(({ job, top }) => (
          <MeasuredRow job={job} key={job.id} top={top} onHeightChange={handleHeightChange} />
        ))}
      </div>
    </div>
  )
}
