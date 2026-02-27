"use client"

import { FC } from "react"
import { SearchIcon } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { useJobListContext } from "@/providers/job-list-provider"
import { FilterTab } from "@/hooks/use-job-list"
import { VirtualJobRows } from "@/components/job-list/virtualized-list"

export const JobList: FC = () => {
  const {
    filter,
    setFilter,
    search,
    setSearch,
    topic,
    filteredJobs,
    topicJobs,
    topicSources,
    counts,
    topics,
    jobs,
    handleTopicChange,
  } = useJobListContext()

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "applied", label: "Applied" },
    { key: "not_relevant", label: "Not Relevant" },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
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

        <div className="flex flex-col gap-4 min-[832px]:flex-row min-[832px]:items-center min-[832px]:justify-between">
          {/* Tabs */}
          <ScrollArea>
            <div className="flex w-max items-center gap-1 rounded-lg bg-muted p-1">
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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Search */}
          <div className="relative">
            <InputGroup>
              <InputGroupInput
                className="w-full sm:w-64"
                placeholder="Search jobs..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </div>

      {/* Job list */}
      {filteredJobs.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            {jobs.length === 0
              ? "No jobs found yet. The cron job runs every 6 hours. Please check back soon!"
              : "No jobs match your current filters."}
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
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

          <VirtualJobRows jobs={filteredJobs} />
        </div>
      )}
    </div>
  )
}
