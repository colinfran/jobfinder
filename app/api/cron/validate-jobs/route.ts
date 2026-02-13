import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { processDuplicateJobs, validateJobLinks } from "./validate-job-link"

export const GET = async (request: Request): Promise<NextResponse> => {
  // const authHeader = request.headers.get("authorization")
  // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  console.log("🚀 Validate-jobs endpoint called")

  try {
    // Fetch all jobs from database
    const allJobs = await db.select().from(jobs)
    console.log(`📊 Checking ${allJobs.length} jobs for validity and duplicates`)
    // Process duplicates
    const { duplicatesRemoved } = await processDuplicateJobs(allJobs)
    // Validate remaining job links
    const { removed: jobsRemoved, errors } = await validateJobLinks()
    console.log(
      `✨ Validation complete. Removed ${jobsRemoved} invalid jobs, ${duplicatesRemoved} duplicates`,
    )
    return NextResponse.json({
      success: true,
      jobsChecked: allJobs.length,
      jobsRemoved,
      duplicatesRemoved,
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
