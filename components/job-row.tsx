"use client"

import type { Job } from "@/lib/db/schema"
import { FC } from "react"
import { Check, Plus } from "lucide-react"

const timeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const sourceColor = (source: string): string => {
  switch (source) {
    case "greenhouse.io":
      return "bg-emerald-500/15 text-emerald-400"
    case "lever.co":
      return "bg-sky-500/15 text-sky-400"
    case "ashbyhq.com":
      return "bg-amber-500/15 text-amber-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

type JobWithApplied = Job & { applied: boolean }

export const JobRow: FC<{ job: JobWithApplied; onToggleApplied: () => void }> = ({
  job,
  onToggleApplied,
}) => {
  const handleLinkClick = (): void => {
    if (!job.applied) {
      onToggleApplied()
    }
  }

  return (
    <div
      className={`group flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/30 sm:grid sm:grid-cols-12 sm:items-center sm:gap-4 ${
        job.applied ? "opacity-60" : ""
      }`}
    >
      {/* Job title & company */}
      <div className="col-span-5 flex flex-col gap-0.5 overflow-hidden">
        <a
          className="truncate text-sm font-medium text-foreground underline-offset-2 hover:underline"
          href={job.link}
          rel="noopener noreferrer"
          target="_blank"
          title={job.title}
          onClick={handleLinkClick}
        >
          {job.title}
        </a>
        {job.company && (
          <span className="truncate text-xs text-muted-foreground">{job.company}</span>
        )}
      </div>

      {/* Source */}
      <div className="col-span-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sourceColor(job.source || "")}`}
        >
          {job.source || "unknown"}
        </span>
      </div>

      {/* Date */}
      <div className="col-span-3">
        <span className="text-xs text-muted-foreground">{timeAgo(new Date(job.createdAt))}</span>
      </div>

      {/* Status */}
      <div className="col-span-2 flex justify-end">
        <button
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
            job.applied
              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
              : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          }`}
          title="Click to toggle applied status"
          onClick={onToggleApplied}
        >
          {job.applied ? (
            <>
              <Check className="h-3 w-3" />
              Applied
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              New
            </>
          )}
        </button>
      </div>
    </div>
  )
}
