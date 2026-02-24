export type LocationInfo = {
  location: string | null
  locationType: string | null
}

export type Job = {
  id: string
  title: string
  link: string
}

export type JobsResponse = {
  jobs: Job[]
}
