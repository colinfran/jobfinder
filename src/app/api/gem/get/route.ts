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
    // Get all Gem jobs
    const gemJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        link: jobs.link,
      })
      .from(jobs)
      .where(like(jobs.source, "%gem.com%"))

    console.log(`📊 Pulled in ${gemJobs.length} Gem jobs from the db`)

    return NextResponse.json({
      success: true,
      jobs: gemJobs,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error"
    console.error("❌ Failed to fetch Gem jobs:", err)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}
