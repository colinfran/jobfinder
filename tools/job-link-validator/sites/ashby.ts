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

  // For "Hybrid" or "Remote" location types, check if remote or SF area
  if (normalizedLocationType === "hybrid" || normalizedLocationType === "remote") {
    return isRemote || hasSF
  }

  // If location type is specified but it's something else, invalid
  if (locationType) {
    return false
  }

  // No location type specified - only valid if location itself is SF or Remote
  return hasSF || isRemote
}

export function hasAshbyError(html: string): boolean {
  return html.includes("The job you requested was not found") || html.includes("Job not found")
}

async function extractAshbyLocationFromPage(page: import("puppeteer").Page): Promise<LocationInfo> {
  return page.evaluate(() => {
    const getValue = (label: string): string | null => {
      const headings = Array.from(document.querySelectorAll("h2"))
      const heading = headings.find(
        (node) => (node.textContent || "").trim().toLowerCase() === label,
      )
      if (!heading) return null
      const parent = heading.parentElement
      const value = parent?.querySelector("p")?.textContent || ""
      return value.trim() || null
    }

    return {
      location: getValue("location"),
      locationType: getValue("location type"),
    }
  })
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

            try {
              await page.waitForSelector(".ashby-job-posting-left-pane", { timeout: 5000 })
            } catch {
              // Some pages load the left pane asynchronously; fall back to current content.
            }

            const content = await page.content()
            const isHttpOk = response && response.status() < 400
            const hasError = hasAshbyError(content)

            if (!isHttpOk || hasError) {
              console.log(`❌ Invalid: ${job.title}`)
              invalidJobIds.push(job.id)
              return
            }

            let locationInfo: LocationInfo
            try {
              locationInfo = await extractAshbyLocationFromPage(page)
            } catch {
              locationInfo = extractAshbyLocation(content)
            }

            if (!locationInfo.location) {
              console.log(`⚠️ Unknown location, skipping removal: ${job.title}`)
              return
            }

            if (!isValidAshbyLocation(locationInfo)) {
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
