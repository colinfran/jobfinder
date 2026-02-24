import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { processDuplicateJobs } from "./duplicates"
import { triggerGitHubActionValidation } from "./github"
import { isLinkStillValid } from "./link-check"

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
      const isValid = await isLinkStillValid(job.link)
      if (!isValid) {
        await db.delete(jobs).where(eq(jobs.id, job.id))
        removed++
        console.log(`🗑️ Removed invalid job: ${job.title} (${job.link})`)
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
