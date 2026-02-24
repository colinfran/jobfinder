import type {
  Job,
  JobsResponse,
  WorkdayBoard,
  WorkdayCxsDetailResponse,
  WorkdayPosting,
  WorkdaySearchResponse,
} from "./types"

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
}

export async function fetchWorkdayJobs(appUrl: string, cronSecret: string): Promise<Job[]> {
  console.log("📊 Fetching Workday jobs...")
  const jobsResponse = await fetch(`${appUrl}/api/workday/get`, {
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  })

  if (!jobsResponse.ok) {
    throw new Error(`Failed to fetch Workday jobs: ${jobsResponse.statusText}`)
  }

  const { jobs } = (await jobsResponse.json()) as JobsResponse
  return jobs
}

export async function deleteInvalidWorkdayJobs(
  appUrl: string,
  cronSecret: string,
  invalidJobIds: string[],
): Promise<number> {
  const deleteResponse = await fetch(`${appUrl}/api/workday/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cronSecret}`,
    },
    body: JSON.stringify({ invalidJobIds }),
  })

  if (!deleteResponse.ok) {
    throw new Error(`Failed to delete Workday jobs: ${deleteResponse.statusText}`)
  }

  const result = (await deleteResponse.json()) as { jobsRemoved: number }
  return result.jobsRemoved
}

export async function fetchBoardPostings(board: WorkdayBoard): Promise<WorkdayPosting[] | null> {
  const limit = 20
  const maxPages = 150
  const endpoints = [
    `${board.origin}/wday/cxs/${board.tenant}/${board.site}/jobs`,
    `${board.origin}/wday/cxs/${board.tenant}/${board.site}/jobs/search`,
  ]

  for (const endpoint of endpoints) {
    const postings: WorkdayPosting[] = []
    let offset = 0
    let page = 0
    let successful = false

    while (page < maxPages) {
      page += 1

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...REQUEST_HEADERS,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          appliedFacets: {},
          limit,
          offset,
          searchText: "",
        }),
      })

      if (!response.ok) {
        break
      }

      successful = true
      const payload = (await response.json()) as WorkdaySearchResponse
      const pagePostings = Array.isArray(payload.jobPostings) ? payload.jobPostings : []

      if (pagePostings.length === 0) {
        return postings
      }

      postings.push(...pagePostings)
      offset += limit

      if (typeof payload.total === "number" && postings.length >= payload.total) {
        return postings
      }

      if (pagePostings.length < limit) {
        return postings
      }
    }

    if (successful) {
      return postings
    }
  }

  return null
}

export async function fetchDetailPosting(
  parsed: WorkdayBoard & { jobPath: string | null },
): Promise<WorkdayCxsDetailResponse | null> {
  if (!parsed.jobPath) return null

  const endpoint = `${parsed.origin}/wday/cxs/${parsed.tenant}/${parsed.site}${parsed.jobPath}`
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      ...REQUEST_HEADERS,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as WorkdayCxsDetailResponse
}
