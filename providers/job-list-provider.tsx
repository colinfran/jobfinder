"use client"

import { createContext, useContext, ReactNode, FC } from "react"
import type { Topic } from "@/lib/config/search-queries"
import { JobWithStatus, useJobList } from "@/hooks/use-job-list"

type JobListContextValue = ReturnType<typeof useJobList> & {
  jobs: JobWithStatus[]
  topics: Topic[]
}

const JobListContext = createContext<JobListContextValue | null>(null)

type JobListProviderProps = {
  children: ReactNode
  jobs: JobWithStatus[]
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
