import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { like } from "drizzle-orm"

export const GET = async (request: Request): Promise<NextResponse> => {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all Workday jobs
    const workdayJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        link: jobs.link,
      })
      .from(jobs)
      .where(like(jobs.source, "%myworkdayjobs%"))

    console.log(`📊 Found ${workdayJobs.length} Workday jobs`)

    return NextResponse.json({
      success: true,
      jobs: workdayJobs,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error"
    console.error("❌ Failed to fetch Workday jobs:", err)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}
