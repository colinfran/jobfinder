import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Job } from "@/lib/db/schema"
import {
  markAsApplied,
  markAsUnapplied,
  markAsNotRelevant,
  setLastViewedTopic,
} from "@/components/job-list/actions"
import type { Topic } from "@/lib/config/search-queries"

export type FilterTab = "all" | "new" | "applied" | "not_relevant"
export type JobWithStatus = Job & { applied: boolean; notRelevant: boolean; topic: Topic }

type UseJobListReturn = {
  filter: FilterTab
  setFilter: (filter: FilterTab) => void
  search: string
  setSearch: (search: string) => void
  topic: Topic
  filteredJobs: JobWithStatus[]
  topicJobs: JobWithStatus[]
  topicSources: Set<string>
  counts: {
    all: number
    new: number
    applied: number
    not_relevant: number
  }
  handleTopicChange: (topic: Topic) => void
  handleApplyToggle: (job: JobWithStatus) => void
  handleMarkNotRelevant: (job: JobWithStatus) => void
}

export const useJobList = (jobs: JobWithStatus[], initialTopic: Topic): UseJobListReturn => {
  const [filter, setFilter] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")
  const [topic, setTopic] = useState<Topic>(initialTopic)
  const [, startTransition] = useTransition()
  const router = useRouter()

  // Optimistic local state for instant UI updates
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<number, { applied?: boolean; notRelevant?: boolean }>
  >(new Map())

  // Clear optimistic updates when fresh data arrives from server
  useEffect(() => {
    setOptimisticUpdates(new Map())
  }, [jobs])

  // Merge server data with optimistic updates
  const jobsWithOptimisticUpdates = jobs.map((job) => {
    const update = optimisticUpdates.get(job.id)
    if (!update) return job
    return {
      ...job,
      applied: update.applied ?? job.applied,
      notRelevant: update.notRelevant ?? job.notRelevant,
    }
  })

  const topicJobs = jobsWithOptimisticUpdates.filter((job) => job.topic === topic)
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

  const handleApplyToggle = (job: JobWithStatus): void => {
    const newAppliedState = !job.applied

    // Optimistic update
    setOptimisticUpdates((prev) => {
      const next = new Map(prev)
      next.set(job.id, { ...next.get(job.id), applied: newAppliedState })
      return next
    })

    // Server update in background
    startTransition(async () => {
      try {
        if (newAppliedState) {
          await markAsApplied(job.id)
        } else {
          await markAsUnapplied(job.id)
        }
        router.refresh()
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticUpdates((prev) => {
          const next = new Map(prev)
          next.delete(job.id)
          return next
        })
        console.error("Failed to update job status:", error)
      }
    })
  }

  const handleMarkNotRelevant = (job: JobWithStatus): void => {
    const newNotRelevantState = !job.notRelevant

    // Optimistic update
    setOptimisticUpdates((prev) => {
      const next = new Map(prev)
      next.set(job.id, { ...next.get(job.id), notRelevant: newNotRelevantState })
      return next
    })

    // Server update in background
    startTransition(async () => {
      try {
        await markAsNotRelevant(job.id)
        router.refresh()
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticUpdates((prev) => {
          const next = new Map(prev)
          next.delete(job.id)
          return next
        })
        console.error("Failed to update job status:", error)
      }
    })
  }

  return {
    // State
    filter,
    setFilter,
    search,
    setSearch,
    topic,

    // Computed
    filteredJobs,
    topicJobs,
    topicSources,
    counts,

    // Handlers
    handleTopicChange,
    handleApplyToggle,
    handleMarkNotRelevant,
  }
}
