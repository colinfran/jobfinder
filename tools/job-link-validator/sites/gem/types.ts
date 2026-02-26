export type GemLocationInfo = {
  location: string | null
  workplaceType: string | null
}

export type Job = {
  id: string
  title: string
  link: string
}

export type JobsResponse = {
  jobs: Job[]
}
