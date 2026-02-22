import type { Browser } from "puppeteer"

export type WorkdayLocationInfo = {
  locations: string[]
  remoteType: string | null
}

export function extractWorkdayLocation(html: string): WorkdayLocationInfo {
  // Extract all location values from data-automation-id="locations"
  const locationsMatch = html.match(/<div data-automation-id="locations"[^>]*>[\s\S]*?<\/div>/i)

  const locations: string[] = []
  if (locationsMatch) {
    const locationSection = locationsMatch[0]
    const locationRegex = /<dd class="[^"]*">([^<]+)<\/dd>/g
    let match
    while ((match = locationRegex.exec(locationSection)) !== null) {
      locations.push(match[1].trim())
    }
  }

  // Extract remote type from data-automation-id="remoteType"
  const remoteTypeMatch = html.match(
    /<div data-automation-id="remoteType"[^>]*>[\s\S]*?<dd class="[^"]*">([^<]+)<\/dd>/i,
  )
  const remoteType = remoteTypeMatch?.[1]?.trim() || null

  return { locations, remoteType }
}

async function extractWorkdayLocationFromPage(
  frame: import("puppeteer").Frame,
): Promise<WorkdayLocationInfo> {
  return frame.evaluate(() => {
    const readList = (root: Element | null): string[] => {
      if (!root) return []
      const nodes = Array.from(root.querySelectorAll("dd, li, span"))
      return nodes
        .map((node) => (node.textContent || "").trim())
        .filter((value) => value.length > 0)
    }

    const getByAutomationId = (id: string): string[] =>
      readList(document.querySelector(`[data-automation-id="${id}"]`))

    const findDetailsValue = (label: string): string[] => {
      const details = document.querySelector('[data-automation-id="job-posting-details"]')
      if (!details) return []

      const headings = Array.from(details.querySelectorAll("dt"))
      const heading = headings.find((node) =>
        (node.textContent || "").trim().toLowerCase().includes(label),
      )
      if (!heading) return []

      const values: string[] = []
      let sibling = heading.nextElementSibling
      while (sibling && sibling.tagName === "DD") {
        const text = (sibling.textContent || "").trim()
        if (text) values.push(text)
        sibling = sibling.nextElementSibling
      }
      return values
    }

    const locations = getByAutomationId("locations")
    const fallbackLocations = locations.length > 0 ? locations : findDetailsValue("location")

    const remoteTypeValues = getByAutomationId("remoteType")
    const fallbackRemote =
      remoteTypeValues.length > 0 ? remoteTypeValues : findDetailsValue("remote type")
    const remoteType = fallbackRemote[0] || null

    return { locations: fallbackLocations, remoteType }
  })
}

async function findFrameWithSelector(
  page: import("puppeteer").Page,
  selector: string,
): Promise<import("puppeteer").Frame | null> {
  const frames = page.frames()
  for (const frame of frames) {
    const handle = await frame.$(selector)
    if (handle) {
      await handle.dispose()
      return frame
    }
  }
  return null
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

export function hasWorkdayError(html: string): boolean {
  return (
    html.includes('data-automation-id="errorMessage"') ||
    html.includes("The page you are looking for doesn't exist") ||
    html.includes("Job not found") ||
    html.includes("The job you are looking for is no longer available")
  )
}

type Job = {
  id: string
  title: string
  link: string
}

type JobsResponse = {
  jobs: Job[]
}

export async function validateWorkdayJobs(
  appUrl: string,
  cronSecret: string,
  browser: Browser,
): Promise<void> {
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

  // Process jobs in batches of 5 for concurrency
  const batchSize = 5
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async (job) => {
        const page = await browser.newPage()
        page.setDefaultTimeout(10000)
        try {
          await page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          )
          await page.setViewport({ width: 1280, height: 800 })
          await page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
          })

          console.log(`🔍 Validating: ${job.title}`)

          try {
            const response = await page.goto(job.link, {
              waitUntil: "networkidle2",
            })

            await new Promise((resolve) => setTimeout(resolve, 1000))

            try {
              await page.waitForSelector('[data-automation-id="job-posting-details"]', {
                timeout: 7000,
              })
            } catch {
              // Some Workday pages load location differently; fall back to current content.
            }

            const content = await page.content()
            const isHttpOk = response && response.status() < 400
            const hasError = hasWorkdayError(content)

            if (!isHttpOk || hasError) {
              console.log(`❌ Invalid: ${job.title}`)
              invalidJobIds.push(job.id)
              return
            }

            let locationInfo: WorkdayLocationInfo
            try {
              const detailsSelector = '[data-automation-id="job-posting-details"]'
              const frame = await findFrameWithSelector(page, detailsSelector)
              if (!frame) {
                console.log(`⚠️ Missing job-posting-details, skipping removal: ${job.title}`)
                return
              }
              locationInfo = await extractWorkdayLocationFromPage(frame)
            } catch {
              locationInfo = extractWorkdayLocation(content)
            }
            if (locationInfo.locations.length === 0) {
              console.log(`⚠️ Unknown location, skipping removal: ${job.title}`)
              return
            }

            if (!isValidWorkdayLocation(locationInfo)) {
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
