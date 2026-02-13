import { NextResponse } from "next/server"
import { SEARCH_QUERIES } from "@/lib/config/search-queries"
import { processSearchQuery } from "./serper-service"

export const GET = async (request: Request): Promise<NextResponse> => {
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("🚀 Scrape-jobs endpoint called")
  console.log(`📊 Processing ${SEARCH_QUERIES.length} search queries`)

  let totalInserted = 0
  const allErrors: string[] = []

  for (const query of SEARCH_QUERIES) {
    const { inserted, errors } = await processSearchQuery(query)
    totalInserted += inserted
    allErrors.push(...errors)
  }

  console.log(`✨ Scrape complete. Inserted ${totalInserted} jobs`)
  return NextResponse.json({
    success: true,
    queriesProcessed: SEARCH_QUERIES.length,
    jobsInserted: totalInserted,
    errors: allErrors.length > 0 ? allErrors : undefined,
    timestamp: new Date().toISOString(),
  })
}
