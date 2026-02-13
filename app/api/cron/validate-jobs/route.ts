import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"
import { isLinkStillValid, normalizeJobUrl } from "./validate-job-link"

export const GET = async (request: Request): Promise<NextResponse> => {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("🚀 Validate-jobs endpoint called")

  try {
    // Fetch all jobs from database
    const allJobs = await db.select().from(jobs)
    console.log(`📊 Checking ${allJobs.length} jobs for validity and duplicates`)

    let removedCount = 0
    let duplicatesRemoved = 0
    const errors: string[] = []

    // First pass: detect and remove duplicates
    const urlMap = new Map<string, typeof allJobs>()
    for (const job of allJobs) {
      const normalized = normalizeJobUrl(job.link)
      if (!urlMap.has(normalized)) {
        urlMap.set(normalized, [])
      }
      urlMap.get(normalized)!.push(job)
    }

    // For each normalized URL with duplicates, keep oldest, delete others
    const jobsToDelete: number[] = []
    for (const [normalizedUrl, jobGroup] of urlMap.entries()) {
      if (jobGroup.length > 1) {
        // Sort by createdAt, keep the first one (oldest)
        jobGroup.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        // Mark duplicates for deletion
        for (let i = 1; i < jobGroup.length; i++) {
          jobsToDelete.push(jobGroup[i].id)
          console.log(
            `🔀 Removing duplicate: ${jobGroup[i].title} (kept original from ${jobGroup[0].createdAt})`,
          )
          duplicatesRemoved++
        }
      }
    }

    // Delete duplicates in batch
    if (jobsToDelete.length > 0) {
      await db.delete(jobs).where(inArray(jobs.id, jobsToDelete))
    }

    // Second pass: validate remaining job links with a small delay to avoid overwhelming the job sites
    const remainingJobs = await db.select().from(jobs)
    for (const job of remainingJobs) {
      try {
        const isValid = await isLinkStillValid(job.link)

        if (!isValid) {
          await db.delete(jobs).where(eq(jobs.id, job.id))
          removedCount++
          console.log(`🗑️ Removed invalid job: ${job.title} (${job.link})`)
        } else {
          console.log(`✅ Valid: ${job.title}`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        console.error(`❌ Error checking job ${job.id}:`, err)
        errors.push(`Failed to validate job ${job.id}: ${errorMsg}`)
      }

      // Small delay between requests to be respectful to job sites
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log(
      `✨ Validation complete. Removed ${removedCount} invalid jobs, ${duplicatesRemoved} duplicates`,
    )

    return NextResponse.json({
      success: true,
      jobsChecked: allJobs.length,
      jobsRemoved: removedCount,
      duplicatesRemoved: duplicatesRemoved,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error"
    console.error("❌ Validation job failed:", err)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}
