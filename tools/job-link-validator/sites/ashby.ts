import type { Browser } from "puppeteer"

export type LocationInfo = {
  location: string | null
  locationType: string | null
}

export function extractAshbyLocation(html: string): LocationInfo {
  // Match the Location section
  const locationMatch = html.match(/<h2[^>]*>Location<\/h2>\s*<p[^>]*>([^<]+)<\/p>/i)
  const location = locationMatch?.[1]?.trim() || null

  // Match the Location Type section
  const locationTypeMatch = html.match(/<h2[^>]*>Location Type<\/h2>\s*<p[^>]*>([^<]+)<\/p>/i)
  const locationType = locationTypeMatch?.[1]?.trim() || null

  return { location, locationType }
}

export function isValidAshbyLocation(locationInfo: LocationInfo): boolean {
  const { location, locationType } = locationInfo

  // If location is missing, treat as invalid
  if (!location) {
    return false
  }

  const normalizedLocation = location.toLowerCase()
  const normalizedLocationType = locationType?.toLowerCase() || null

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
  ]
  const hasSF = sfVariations.some((variation) => normalizedLocation.includes(variation))

  // Check if remote
  const isRemote = normalizedLocation.includes("remote") || normalizedLocationType === "remote"

  // If Location Type is "On-site", only valid if in SF area
  if (normalizedLocationType === "on-site") {
    return hasSF
  }

  // If no Location Type specified, include it (can't determine, be permissive)
  if (!locationType) {
    return true
  }

  // For Remote or Hybrid location types, check if remote or SF area
  return isRemote || hasSF
}

export function isValidAshbyJob(html: string): boolean {
  // Check if page contains error messages
  if (html.includes("The job you requested was not found") || html.includes("Job not found")) {
    return false
  }

  // Check location
  const locationInfo = extractAshbyLocation(html)
  return isValidAshbyLocation(locationInfo)
}

type Job = {
  id: string
  title: string
  link: string
}

type JobsResponse = {
  jobs: Job[]
}

export async function validateAshbyJobs(
  appUrl: string,
  cronSecret: string,
  browser: Browser,
): Promise<void> {
  console.log("\n🔷 Starting Ashby job validation")

  // Get all Ashby jobs from your API endpoint
  console.log("📊 Fetching Ashby jobs...")
  const jobsResponse = await fetch(`${appUrl}/api/ashby/get`, {
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  })

  if (!jobsResponse.ok) {
    throw new Error(`Failed to fetch Ashby jobs: ${jobsResponse.statusText}`)
  }

  const { jobs } = (await jobsResponse.json()) as JobsResponse
  console.log(`📋 Found ${jobs.length} Ashby jobs to validate`)

  const invalidJobIds: string[] = []

  // Process jobs in batches of 5 for concurrency
  const batchSize = 5
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async (job) => {
        const page = await browser.newPage()
        page.setDefaultTimeout(10000)
        try {
          console.log(`🔍 Validating: ${job.title}`)

          try {
            const response = await page.goto(job.link, {
              waitUntil: "networkidle2",
            })

            const content = await page.content()
            const isValid = response && response.status() < 400 && isValidAshbyJob(content)

            if (!isValid) {
              console.log(`❌ Invalid: ${job.title}`)
              invalidJobIds.push(job.id)
            } else {
              console.log(`✅ Valid: ${job.title}`)
            }
          } catch (_err) {
            console.log(`⚠️ Error loading page: ${job.title}`)
            invalidJobIds.push(job.id)
          }
        } catch (err) {
          console.error(`Error validating job ${job.id}:`, err)
        } finally {
          await page.close()
        }
      }),
    )

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // Send invalid job IDs to your API
  if (invalidJobIds.length > 0) {
    console.log(`\n🗑️ Removing ${invalidJobIds.length} invalid Ashby jobs`)

    const deleteResponse = await fetch(`${appUrl}/api/ashby/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({ invalidJobIds }),
    })

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete Ashby jobs: ${deleteResponse.statusText}`)
    }

    const result = (await deleteResponse.json()) as { jobsRemoved: number }
    console.log(`✨ ${result.jobsRemoved} Ashby jobs removed`)
  } else {
    console.log("✨ All Ashby jobs are valid!")
  }
}
