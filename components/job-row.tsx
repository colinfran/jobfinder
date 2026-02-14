"use client"

import type { Job } from "@/lib/db/schema"
import { FC } from "react"
import { Check, Plus, EllipsisVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"

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
      return "bg-teal-500/15 text-teal-600"
    case "lever.co":
      return "bg-gray-100/15 text-gray-400"
    case "ashbyhq.com":
      return "bg-violet-500/15 text-violet-600"
    case "myworkdayjobs.com":
      return "bg-blue-500/15 text-blue-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}

type JobWithApplied = Job & { applied: boolean; notRelevant: boolean }

export const JobRow: FC<{
  job: JobWithApplied
  onToggleApplied: () => void
  onMarkNotRelevant: () => void
}> = ({ job, onToggleApplied, onMarkNotRelevant }) => {
  const handleLinkClick = (): void => {
    if (!job.applied) {
      onToggleApplied()
    }
  }

  return (
    <div
      className={`group relative flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/30 sm:grid sm:grid-cols-12 sm:items-center sm:gap-4 ${
        job.applied ? "opacity-60" : ""
      }`}
    >
      {/* Job title & company */}
      <div className="col-span-4 flex flex-col gap-0.5 overflow-hidden">
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
      <div className="col-span-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sourceColor(job.source || "")}`}
        >
          {job.source || "unknown"}
        </span>
      </div>

      {/* Date */}
      <div className="col-span-2">
        <span className="text-xs text-muted-foreground">{timeAgo(new Date(job.createdAt))}</span>
      </div>

      <div className="absolute top-3 right-4 sm:static sm:col-span-1 sm:flex sm:justify-end sm:items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="cursor-pointer" variant="outline">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" onClick={onMarkNotRelevant}>
              {job.notRelevant ? "Mark as Relevant" : "Mark as Not Relevant"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status & Menu */}
      <div className="col-span-2 flex justify-end items-center gap-2">
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
