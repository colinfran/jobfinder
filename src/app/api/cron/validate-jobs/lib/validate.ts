import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { processDuplicateJobs } from "./duplicates"
import { triggerGitHubActionValidation } from "./github"
import { validateLinkWithReason, type LinkValidationResult } from "./link-check"

const formatValidationReason = (result: LinkValidationResult): string => {
  if (result.reason === "http-error") {
    return `HTTP ${result.status ?? "unknown"}`
  }

  if (result.reason === "greenhouse-content-invalid") {
    return "Greenhouse content check failed"
  }

  if (result.reason === "lever-content-invalid") {
    return "Lever content check failed"
  }

  if (result.reason === "rippling-content-invalid") {
    return "Rippling content check failed"
  }

  if (result.reason === "timeout") {
    return "Request timed out"
  }

  if (result.reason === "network-error") {
    return "Network error"
  }

  if (result.reason === "invalid-url") {
    return "Invalid URL"
  }

  return result.reason
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export const validateJobLinks = async (): Promise<{
  removed: number
  duplicatesRemoved: number
  errors: string[]
}> => {
  await triggerGitHubActionValidation()
  const allJobs = await db.select().from(jobs)

  const { duplicatesRemoved } = await processDuplicateJobs(allJobs)
  console.log(`🔀 Removed ${duplicatesRemoved} duplicate jobs`)

  const jobsAfterDedup = await db.select().from(jobs)
  const remainingJobs = jobsAfterDedup.filter(
    (job) => !job.source?.includes("ashbyhq") && !job.source?.includes("myworkdayjobs"),
  )

  console.log(
    `⏭️ Skipping ${jobsAfterDedup.length - remainingJobs.length} Ashby and Workday jobs (validated by GitHub Actions)`,
  )

  let removed = 0
  const errors: string[] = []
  const timedOutJobs: typeof remainingJobs = []

  for (const job of remainingJobs) {
    try {
      const validation = await validateLinkWithReason(job.link)
      if (!validation.isValid) {
        if (validation.reason === "timeout") {
          timedOutJobs.push(job)
          console.log(`⏳ Queueing timeout retry: ${job.title}`)
          console.log(`   ↳ link=${job.link}`)
        } else {
          await db.delete(jobs).where(eq(jobs.id, job.id))
          removed++
          console.log(`🗑️ Removed invalid job: ${job.title}`)
          console.log(`   ↳ reason=${formatValidationReason(validation)}`)
          console.log(`   ↳ link=${job.link}`)
        }
      } else {
        console.log(`✅ Valid: ${job.title}`)
      }

      await sleep(500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error(`❌ Error checking job ${job.id}:`, err)
      errors.push(`Failed to validate job ${job.id}: ${errorMsg}`)
    }
  }

  if (timedOutJobs.length > 0) {
    console.log(`🔁 Retrying ${timedOutJobs.length} timeout jobs with 15s timeout`)
  }

  for (const job of timedOutJobs) {
    try {
      const retryValidation = await validateLinkWithReason(job.link, { timeoutMs: 15000 })

      if (!retryValidation.isValid) {
        if (retryValidation.reason === "timeout" || retryValidation.reason === "network-error") {
          console.log(`⏭️ Skipping delete after inconclusive retry: ${job.title}`)
          console.log(`   ↳ reason=${formatValidationReason(retryValidation)}`)
          console.log(`   ↳ link=${job.link}`)
        } else {
          await db.delete(jobs).where(eq(jobs.id, job.id))
          removed++
          console.log(`🗑️ Removed invalid job after retry: ${job.title}`)
          console.log(`   ↳ reason=${formatValidationReason(retryValidation)}`)
          console.log(`   ↳ link=${job.link}`)
        }
      } else {
        console.log(`✅ Valid on retry: ${job.title}`)
      }

      await sleep(500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error(`❌ Error retrying job ${job.id}:`, err)
      errors.push(`Failed to retry validation for job ${job.id}: ${errorMsg}`)
    }
  }

  return { removed, duplicatesRemoved, errors }
}
