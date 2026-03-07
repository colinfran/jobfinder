import type { Job, JobsResponse } from "./types"
import { fetchWithRetry } from "../../fetch-with-retry"

export async function fetchAshbyJobs(appUrl: string, cronSecret: string): Promise<Job[]> {
  console.log("📊 Fetching Ashby jobs...")
  const jobsResponse = await fetchWithRetry(
    `${appUrl}/api/ashby/get`,
    {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    },
    { requestLabel: "Ashby jobs fetch" },
  )

  if (!jobsResponse.ok) {
    throw new Error(`Failed to fetch Ashby jobs: ${jobsResponse.statusText}`)
  }

  const { jobs } = (await jobsResponse.json()) as JobsResponse
  return jobs
}

export async function deleteInvalidAshbyJobs(
  appUrl: string,
  cronSecret: string,
  invalidJobIds: string[],
): Promise<number> {
  const deleteResponse = await fetchWithRetry(
    `${appUrl}/api/ashby/validate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({ invalidJobIds }),
    },
    { requestLabel: "Ashby invalid job delete" },
  )

  if (!deleteResponse.ok) {
    throw new Error(`Failed to delete Ashby jobs: ${deleteResponse.statusText}`)
  }

  const result = (await deleteResponse.json()) as { jobsRemoved: number }
  return result.jobsRemoved
}
