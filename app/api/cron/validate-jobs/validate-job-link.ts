import { eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"

// Helper: check if a URL has unnecessary suffixes
export const hasUnnecessarySuffix = (link: string): boolean => {
  try {
    const url = new URL(link)
    const pathname = url.pathname
    // Check if URL ends with /application or /apply
    return /\/(application|apply)$/.test(pathname)
  } catch {
    return false
  }
}

// Helper: normalize a URL to detect duplicates
export const normalizeJobUrl = (link: string): string => {
  try {
    const url = new URL(link)
    // Remove trailing slash
    let pathname = url.pathname.replace(/\/$/, "")
    // Remove common suffixes that don't change the job posting
    pathname = pathname.replace(/\/(application|apply|career-opportunity)$/, "")
    // Reconstruct normalized URL
    return `${url.protocol}//${url.hostname}${pathname}`
  } catch {
    return link
  }
}

// Helper: check if a job link is still active
export const isLinkStillValid = async (link: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(link, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    clearTimeout(timeout)

    // Consider 2xx and 3xx as valid, 4xx and 5xx as invalid
    return response.status < 400
  } catch (error) {
    // Timeout, network error, or other issues = treat as invalid
    return false
  }
}

// Helper: process duplicate jobs
export const processDuplicateJobs = async (
  allJobs: Array<typeof jobs.$inferSelect>,
): Promise<{ duplicatesRemoved: number }> => {
  const urlMap = new Map<string, Array<typeof jobs.$inferSelect>>()

  // Group jobs by normalized URL
  for (const job of allJobs) {
    const normalized = normalizeJobUrl(job.link)
    if (!urlMap.has(normalized)) {
      urlMap.set(normalized, [])
    }
    urlMap.get(normalized)!.push(job)
  }

  let duplicatesRemoved = 0
  const jobsToDelete: number[] = []
  const jobsToUpdate: Array<{ id: number; newLink: string; title: string }> = []

  // Process each group of duplicates
  for (const [normalizedUrl, jobGroup] of urlMap.entries()) {
    if (jobGroup.length > 1) {
      // Sort by createdAt, keep the first one (oldest)
      jobGroup.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      const jobToKeep = jobGroup[0]

      // Queue the oldest job's URL to be updated to the clean version
      if (jobToKeep.link !== normalizedUrl) {
        jobsToUpdate.push({
          id: jobToKeep.id,
          newLink: normalizedUrl,
          title: jobToKeep.title,
        })
      }

      // Mark duplicates for deletion
      for (let i = 1; i < jobGroup.length; i++) {
        jobsToDelete.push(jobGroup[i].id)
        console.log(`🔀 Removing duplicate: ${jobGroup[i].title} (kept oldest with clean URL)`)
        duplicatesRemoved++
      }
    }
  }

  // Delete duplicates in batch FIRST
  if (jobsToDelete.length > 0) {
    await db.delete(jobs).where(inArray(jobs.id, jobsToDelete))
  }

  // Then update the URLs
  for (const update of jobsToUpdate) {
    await db.update(jobs).set({ link: update.newLink }).where(eq(jobs.id, update.id))
    console.log(`🔗 Updated URL for: ${update.title}`)
  }

  return { duplicatesRemoved }
}

// Helper: validate all job links
export const validateJobLinks = async (): Promise<{ removed: number; errors: string[] }> => {
  const remainingJobs = await db.select().from(jobs)
  let removed = 0
  const errors: string[] = []

  for (const job of remainingJobs) {
    try {
      const isValid = await isLinkStillValid(job.link)

      if (!isValid) {
        await db.delete(jobs).where(eq(jobs.id, job.id))
        removed++
        console.log(`🗑️ Removed invalid job: ${job.title} (${job.link})`)
      } else {
        console.log(`✅ Valid: ${job.title}`)
      }

      // Small delay between requests to be respectful to job sites
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error(`❌ Error checking job ${job.id}:`, err)
      errors.push(`Failed to validate job ${job.id}: ${errorMsg}`)
    }
  }

  return { removed, errors }
}
