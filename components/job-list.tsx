"use client"

import { FC, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Job } from "@/lib/db/schema"
import {
  markAsApplied,
  markAsUnapplied,
  markAsNotRelevant,
  setLastViewedTopic,
} from "@/app/actions"
import { JobRow } from "@/components/job-row"
import type { Topic } from "@/lib/config/search-queries"

type FilterTab = "all" | "new" | "applied" | "not_relevant"
type JobWithMeta = Job & { applied: boolean; notRelevant: boolean; topic: Topic }

export const JobList: FC<{
  jobs: JobWithMeta[]
  topics: Topic[]
  initialTopic: Topic
}> = ({ jobs, topics, initialTopic }) => {
  const [filter, setFilter] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")
  const [topic, setTopic] = useState<Topic>(initialTopic)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const topicJobs = jobs.filter((job) => job.topic === topic)
  const topicSources = new Set(topicJobs.map((job) => job.source || "unknown"))

  const filteredJobs = topicJobs.filter((job) => {
    // Tab filter
    if (filter === "new" && (job.applied || job.notRelevant)) return false
    if (filter === "applied" && !job.applied) return false
    if (filter === "not_relevant" && !job.notRelevant) return false

    // Text search
    if (search) {
      const q = search.toLowerCase()
      return (
        job.title.toLowerCase().includes(q) ||
        (job.company && job.company.toLowerCase().includes(q)) ||
        (job.snippet && job.snippet.toLowerCase().includes(q)) ||
        (job.source && job.source.toLowerCase().includes(q))
      )
    }

    return true
  })

  const counts = {
    all: topicJobs.length,
    new: topicJobs.filter((j) => !j.applied && !j.notRelevant).length,
    applied: topicJobs.filter((j) => j.applied).length,
    not_relevant: topicJobs.filter((j) => j.notRelevant).length,
  }

  const handleTopicChange = (nextTopic: Topic): void => {
    setTopic(nextTopic)
    setFilter("all")
    startTransition(async () => {
      await setLastViewedTopic(nextTopic)
    })
  }

  const handleApplyToggle = (job: JobWithMeta): void => {
    startTransition(async () => {
      if (job.applied) {
        await markAsUnapplied(job.id)
      } else {
        await markAsApplied(job.id)
      }
      router.refresh()
    })
  }

  const handleMarkNotRelevant = (job: JobWithMeta): void => {
    startTransition(async () => {
      await markAsNotRelevant(job.id)
      router.refresh()
    })
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "applied", label: "Applied" },
    { key: "not_relevant", label: "Not Relevant" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {topicJobs.length} jobs found across {topicSources.size} sources
      </p>
      {/* Header controls */}
      <div className="flex flex-col gap-4">
        {/* Topics */}
        <div className="flex flex-wrap items-center gap-2">
          {topics.map((tabTopic) => (
            <button
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                topic === tabTopic
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              key={tabTopic}
              onClick={() => handleTopicChange(tabTopic)}
            >
              {tabTopic === "software" ? "Software" : "Finance"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-max">
            {tabs.map((tab) => (
              <button
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                key={tab.key}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span
                  className={`ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs ${
                    filter === tab.key ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring sm:w-64"
              placeholder="Search jobs..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Job list */}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            {jobs.length === 0
              ? "No jobs found yet. The cron job runs every 6 hours. Please check back soon!"
              : "No jobs match your current filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Table header */}
          <div className="hidden border-b border-border bg-muted/50 px-4 py-3 sm:grid sm:grid-cols-12 sm:gap-4">
            <div className="col-span-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Job
            </div>
            <div className="col-span-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Source
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Found
            </div>
            <div className="col-span-1 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Actions
            </div>
            <div className="col-span-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border">
            {filteredJobs.map((job) => (
              <JobRow
                job={job}
                key={job.id}
                onMarkNotRelevant={() => handleMarkNotRelevant(job)}
                onToggleApplied={() => handleApplyToggle(job)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
