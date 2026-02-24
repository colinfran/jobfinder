export type WorkdayLocationInfo = {
  locations: string[]
  remoteType: string | null
}

export type WorkdayBoard = {
  origin: string
  tenant: string
  site: string
}

export type WorkdayPosting = {
  externalPath?: string
  locationsText?: string
  remoteType?: string | null
}

export type WorkdayJobPostingInfo = {
  location?: string
  additionalLocations?: string[]
  remoteType?: string | null
  posted?: boolean
}

export type WorkdayCxsDetailResponse = {
  jobPostingInfo?: WorkdayJobPostingInfo
}

export type WorkdaySearchResponse = {
  jobPostings?: WorkdayPosting[]
  total?: number
}

export type WorkdayPostingIndex = {
  byFullPathToPosting: Map<string, WorkdayPosting>
  byJobPathToPosting: Map<string, WorkdayPosting>
  byToken: Map<string, WorkdayPosting>
}

export type Job = {
  id: string
  title: string
  link: string
}

export type JobsResponse = {
  jobs: Job[]
}
