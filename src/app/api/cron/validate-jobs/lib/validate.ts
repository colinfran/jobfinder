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

  if (result.reason === "timeout") {
    return "Request timed out (5s)"
  }

  if (result.reason === "network-error") {
    return "Network error"
  }

  if (result.reason === "invalid-url") {
    return "Invalid URL"
  }

  return result.reason
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

  for (const job of remainingJobs) {
    try {
      const validation = await validateLinkWithReason(job.link)
      if (!validation.isValid) {
        await db.delete(jobs).where(eq(jobs.id, job.id))
        removed++
        console.log(`🗑️ Removed invalid job: ${job.title}`)
        console.log(`   ↳ reason=${formatValidationReason(validation)}`)
        console.log(`   ↳ link=${job.link}`)
      } else {
        console.log(`✅ Valid: ${job.title}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error(`❌ Error checking job ${job.id}:`, err)
      errors.push(`Failed to validate job ${job.id}: ${errorMsg}`)
    }
  }

  return { removed, duplicatesRemoved, errors }
}
