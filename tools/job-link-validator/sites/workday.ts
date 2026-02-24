export type WorkdayLocationInfo = {
  locations: string[]
  remoteType: string | null
}

export function isValidWorkdayLocation(locationInfo: WorkdayLocationInfo): boolean {
  const { locations, remoteType } = locationInfo

  // If no locations found, treat as invalid
  if (locations.length === 0) {
    return false
  }

  const normalizedRemoteType = remoteType?.toLowerCase() || null

  // Check for San Francisco variations
  const sfVariations = [
    "san francisco",
    "sf bay area",
    "sf bay",
    "bay area",
    "san francisco bay area",
    "san francisco,",
    "sf,",
    "sf ", // with space
    "san jose", // Include San Jose for Bay Area
  ]

  // Check if any location matches SF area
  const hasSF = locations.some((location) => {
    const normalizedLocation = location.toLowerCase()
    return sfVariations.some((variation) => normalizedLocation.includes(variation))
  })

  // Check if remote
  const isRemote =
    normalizedRemoteType === "remote" ||
    locations.some((loc) => loc.toLowerCase().includes("remote"))

  // For "On-site", only valid if in SF area
  if (normalizedRemoteType === "on-site") {
    return hasSF
  }

  // For "Hybrid" or "Remote", check if remote or SF area
  if (normalizedRemoteType === "hybrid" || normalizedRemoteType === "remote") {
    return isRemote || hasSF
  }

  // If remote type is specified but it's something else, invalid
  if (remoteType) {
    return false
  }

  // No remote type specified - only valid if locations contain SF or Remote
  return hasSF || isRemote
}

type WorkdayBoard = {
  origin: string
  tenant: string
  site: string
}

type WorkdayPosting = {
  externalPath?: string
  locationsText?: string
  remoteType?: string | null
}

type WorkdayJobPostingInfo = {
  location?: string
  additionalLocations?: string[]
  remoteType?: string | null
  posted?: boolean
}

type WorkdayCxsDetailResponse = {
  jobPostingInfo?: WorkdayJobPostingInfo
}

type WorkdaySearchResponse = {
  jobPostings?: WorkdayPosting[]
  total?: number
}

type WorkdayPostingIndex = {
  byFullPathToPosting: Map<string, WorkdayPosting>
  byJobPathToPosting: Map<string, WorkdayPosting>
  byToken: Map<string, WorkdayPosting>
}

function normalizePath(path: string): string {
  const withoutQuery = path.split("?")[0]?.split("#")[0] ?? ""
  return withoutQuery.replace(/\/+$/, "").toLowerCase()
}

function extractJobPathFromPath(path: string): string | null {
  const normalizedPath = normalizePath(path)
  const parts = normalizedPath.split("/").filter(Boolean)
  const jobIndex = parts.indexOf("job")
  if (jobIndex === -1) return null
  return normalizePath(`/${parts.slice(jobIndex).join("/")}`)
}

function extractReqId(value: string): string | null {
  const decoded = decodeURIComponent(value)
  const match = decoded.match(
    /(?:_|\/|-)((?:r[-_ ]?\d{4,}|jr[-_ ]?\d{3,}|req[-_ ]?\d{3,}|job[-_ ]?\d{3,}|[a-z]{1,4}\d{5,}|\d{5,}))(?=$|[_/:\-?&#])/i,
  )
  if (!match) return null

  const token = match[1].replace(/[-_ ]+/g, "").toUpperCase()
  return token
}

function extractBoardAndPaths(
  jobLink: string,
): (WorkdayBoard & { fullPath: string; jobPath: string | null }) | null {
  try {
    const url = new URL(jobLink)
    const hostParts = url.hostname.split(".")
    const tenant = hostParts[0]
    if (!tenant) return null

    const fullPath = normalizePath(url.pathname)
    if (!fullPath) return null

    const jobPath = extractJobPathFromPath(fullPath)
    if (!jobPath) return null

    const pathParts = fullPath.split("/").filter(Boolean)
    const jobIndex = pathParts.indexOf("job")
    const site = pathParts[jobIndex - 1]
    if (!site) return null

    return { origin: url.origin, tenant, site, fullPath, jobPath }
  } catch {
    return null
  }
}

function buildPostingIndex(postings: WorkdayPosting[]): WorkdayPostingIndex {
  const byFullPathToPosting = new Map<string, WorkdayPosting>()
  const byJobPathToPosting = new Map<string, WorkdayPosting>()
  const byToken = new Map<string, WorkdayPosting>()

  for (const posting of postings) {
    if (!posting.externalPath) continue

    const normalizedFullPath = normalizePath(posting.externalPath)
    if (normalizedFullPath) {
      byFullPathToPosting.set(normalizedFullPath, posting)

      const jobPath = extractJobPathFromPath(normalizedFullPath)
      if (jobPath) {
        byJobPathToPosting.set(jobPath, posting)
      }
    }

    const token = extractReqId(posting.externalPath)
    if (token) byToken.set(token, posting)
  }

  return { byFullPathToPosting, byJobPathToPosting, byToken }
}

function extractLocationInfoFromPosting(posting: WorkdayPosting): WorkdayLocationInfo | null {
  const locations = posting.locationsText
    ? posting.locationsText
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean)
    : []

  const remoteType = typeof posting.remoteType === "string" ? posting.remoteType : null
  if (locations.length === 0) return null

  return { locations, remoteType }
}

function extractLocationInfoFromDetail(
  response: WorkdayCxsDetailResponse,
): WorkdayLocationInfo | null {
  const info = response.jobPostingInfo
  if (!info) return null

  const locations: string[] = []
  if (info.location) locations.push(info.location)
  if (Array.isArray(info.additionalLocations)) {
    locations.push(...info.additionalLocations)
  }

  if (locations.length === 0) {
    return null
  }

  return { locations, remoteType: info.remoteType ?? null }
}

async function fetchBoardPostings(board: WorkdayBoard): Promise<WorkdayPosting[] | null> {
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
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
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

async function fetchDetailPosting(
  parsed: WorkdayBoard & { jobPath: string | null },
): Promise<WorkdayCxsDetailResponse | null> {
  if (!parsed.jobPath) return null

  const endpoint = `${parsed.origin}/wday/cxs/${parsed.tenant}/${parsed.site}${parsed.jobPath}`
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as WorkdayCxsDetailResponse
}

type Job = {
  id: string
  title: string
  link: string
}

type JobsResponse = {
  jobs: Job[]
}

export async function validateWorkdayJobs(appUrl: string, cronSecret: string): Promise<void> {
  console.log("\n🔶 Starting Workday job validation")

  // Get all Workday jobs from your API endpoint
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
  console.log(`📋 Found ${jobs.length} Workday jobs to validate`)

  const invalidJobIds: string[] = []
  const jobsByBoard = new Map<string, Job[]>()

  for (const job of jobs) {
    const parsed = extractBoardAndPaths(job.link)
    if (!parsed) {
      console.log(`⚠️ Unsupported Workday URL, skipping removal: ${job.title}`)
      continue
    }

    const boardKey = `${parsed.origin}|${parsed.tenant}|${parsed.site}`
    const boardJobs = jobsByBoard.get(boardKey)
    if (boardJobs) {
      boardJobs.push(job)
    } else {
      jobsByBoard.set(boardKey, [job])
    }
  }

  for (const [boardKey, boardJobs] of jobsByBoard.entries()) {
    const [origin, tenant, site] = boardKey.split("|")
    if (!origin || !tenant || !site) continue

    console.log(`🌐 Fetching Workday board index: ${tenant}/${site} (${boardJobs.length} jobs)`)
    const postings = await fetchBoardPostings({ origin, tenant, site })
    if (!postings) {
      console.log(`⚠️ Could not fetch board index, skipping removal: ${tenant}/${site}`)
      continue
    }

    const postingIndex = buildPostingIndex(postings)

    for (const job of boardJobs) {
      try {
        console.log(`🔍 Validating: ${job.title}`)
        const parsed = extractBoardAndPaths(job.link)
        if (!parsed) {
          console.log(`⚠️ Unsupported Workday URL, skipping removal: ${job.title}`)
          continue
        }

        const reqId = extractReqId(parsed.fullPath)
        const fullPathMatch = postingIndex.byFullPathToPosting.get(parsed.fullPath) ?? null
        const jobPathMatch = parsed.jobPath
          ? (postingIndex.byJobPathToPosting.get(parsed.jobPath) ?? null)
          : null
        const reqIdMatch = reqId ? (postingIndex.byToken.get(reqId) ?? null) : null
        const matchedPosting = fullPathMatch ?? jobPathMatch ?? reqIdMatch

        if (!matchedPosting) {
          const detailResponse = await fetchDetailPosting(parsed)
          if (detailResponse?.jobPostingInfo) {
            if (detailResponse.jobPostingInfo.posted === false) {
              console.log(`❌ Invalid (detail says unposted): ${job.title}`)
              console.log(`   ↳ link=${job.link}`)
              invalidJobIds.push(job.id)
              continue
            }

            const detailLocationInfo = extractLocationInfoFromDetail(detailResponse)
            if (!detailLocationInfo) {
              console.log(`✅ Valid (detail match, no location data): ${job.title}`)
              continue
            }

            if (!isValidWorkdayLocation(detailLocationInfo)) {
              console.log(`❌ Invalid (detail location): ${job.title}`)
              console.log(`   ↳ link=${job.link}`)
              invalidJobIds.push(job.id)
            } else {
              console.log(`✅ Valid (detail match): ${job.title}`)
            }
            continue
          }

          const boardIndexSize = postingIndex.byFullPathToPosting.size
          console.log(`❌ Invalid (not in board index): ${job.title}`)
          console.log(
            `   ↳ board=${tenant}/${site} entries=${boardIndexSize} jobPath=${parsed.jobPath ?? "n/a"} req=${reqId ?? "n/a"}`,
          )
          console.log(`   ↳ link=${job.link}`)
          invalidJobIds.push(job.id)
          continue
        }

        if (!fullPathMatch && !jobPathMatch && reqIdMatch) {
          console.log(`✅ Valid (req-id match): ${job.title}`)
        } else if (!fullPathMatch && jobPathMatch) {
          console.log(`✅ Valid (job-path match): ${job.title}`)
        } else if (fullPathMatch) {
          console.log(`✅ Valid (full-path match): ${job.title}`)
        } else {
          console.log(`✅ Valid: ${job.title}`)
        }

        const locationInfo = extractLocationInfoFromPosting(matchedPosting)
        if (!locationInfo) {
          console.log(`⚠️ Unknown location, skipping removal: ${job.title}`)
          continue
        }

        if (!isValidWorkdayLocation(locationInfo)) {
          console.log(`❌ Invalid: ${job.title}`)
          console.log(`   ↳ link=${job.link}`)
          invalidJobIds.push(job.id)
          continue
        }

        console.log(`✅ Valid: ${job.title}`)
      } catch (err) {
        console.error(`Error validating job ${job.id}:`, err)
      }
    }

    // Small delay between Workday boards
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  // Send invalid job IDs to your API
  if (invalidJobIds.length > 0) {
    console.log(`\n🗑️ Removing ${invalidJobIds.length} invalid Workday jobs`)

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
    console.log(`✨ ${result.jobsRemoved} Workday jobs removed`)
  } else {
    console.log("✨ All Workday jobs are valid!")
  }
}
