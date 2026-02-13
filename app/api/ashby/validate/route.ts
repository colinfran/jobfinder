import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { inArray } from "drizzle-orm"

export const POST = async (request: Request): Promise<NextResponse> => {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { invalidJobIds } = body

    if (!Array.isArray(invalidJobIds) || invalidJobIds.length === 0) {
      return NextResponse.json(
        { error: "invalidJobIds must be a non-empty array" },
        { status: 400 },
      )
    }

    console.log("🚀 Ashby validation endpoint called")
    console.log(`🗑️ Removing ${invalidJobIds.length} invalid Ashby jobs`)

    // Delete the invalid jobs
    const result = await db.delete(jobs).where(inArray(jobs.id, invalidJobIds))

    console.log(`✨ Removed ${invalidJobIds.length} invalid Ashby jobs`)

    return NextResponse.json({
      success: true,
      jobsRemoved: invalidJobIds.length,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error"
    console.error("❌ Ashby validation failed:", err)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}
