"use client"

import { createContext, useContext, ReactNode, FC, FC } from "react"
import type { Job } from "@/lib/db/schema"
import type { Topic } from "@/lib/config/search-queries"
import { useJobList } from "@/hooks/use-job-list"

type FilterTab = "all" | "new" | "applied" | "not_relevant"
type JobWithMeta = Job & { applied: boolean; notRelevant: boolean; topic: Topic }

type JobListContextValue = ReturnType<typeof useJobList> & {
  jobs: JobWithMeta[]
  topics: Topic[]
}

const JobListContext = createContext<JobListContextValue | null>(null)

type JobListProviderProps = {
  children: ReactNode
  jobs: JobWithMeta[]
  topics: Topic[]
  initialTopic: Topic
}

export const JobListProvider: FC<JobListProviderProps> = ({
  children,
  jobs,
  topics,
  initialTopic,
}) => {
  const hookValue = useJobList(jobs, initialTopic)

  return (
    <JobListContext.Provider value={{ ...hookValue, jobs, topics }}>
      {children}
    </JobListContext.Provider>
  )
}

export const useJobListContext = (): JobListContextValue => {
  const context = useContext(JobListContext)
  if (!context) {
    throw new Error("useJobListContext must be used within JobListProvider")
  }
  return context
}

export type { FilterTab, JobWithMeta }
