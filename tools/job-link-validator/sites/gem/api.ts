import type { Job, JobsResponse } from "./types"

export async function fetchGemJobs(appUrl: string, cronSecret: string): Promise<Job[]> {
  console.log("📊 Fetching Gem jobs...")
  const jobsResponse = await fetch(`${appUrl}/api/gem/get`, {
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  })

  if (!jobsResponse.ok) {
    throw new Error(`Failed to fetch Gem jobs: ${jobsResponse.statusText}`)
  }

  const { jobs } = (await jobsResponse.json()) as JobsResponse
  return jobs
}

export async function deleteInvalidGemJobs(
  appUrl: string,
  cronSecret: string,
  invalidJobIds: string[],
): Promise<number> {
  const deleteResponse = await fetch(`${appUrl}/api/gem/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cronSecret}`,
    },
    body: JSON.stringify({ invalidJobIds }),
  })

  if (!deleteResponse.ok) {
    throw new Error(`Failed to delete Gem jobs: ${deleteResponse.statusText}`)
  }

  const result = (await deleteResponse.json()) as { jobsRemoved: number }
  return result.jobsRemoved
}
