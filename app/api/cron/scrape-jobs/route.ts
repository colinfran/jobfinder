import { NextResponse } from "next/server"
import { SEARCH_QUERIES } from "@/lib/config/search-queries"
import { extractSource } from "@/app/api/cron/scrape-jobs/extract-source"
import { extractCompany } from "@/app/api/cron/scrape-jobs/extract-company"
import { insertJob } from "@/lib/db/insert-job"

interface SerperOrganicResult {
  title: string
  link: string
  snippet: string
  position: number
}

interface SerperResponse {
  organic: SerperOrganicResult[]
}

const serperApiKey = process.env.SERPER_API_KEY!

export const GET = async (request: Request): Promise<NextResponse> => {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("🚀 Scrape-jobs endpoint called")
  console.log(`📊 Processing ${SEARCH_QUERIES.length} search queries`)

  let totalInserted = 0
  const errors: string[] = []

  for (const query of SEARCH_QUERIES) {
    console.log(`🔍 Processing query: ${query}`)
    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": serperApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, num: 20, tbs: "qdr:w" }),
      })

      console.log(`📡 Serper API response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Serper API error: ${errorText}`)
        errors.push(`Serper API error for query "${query}": ${response.status} - ${errorText}`)
        continue
      }

      const data: SerperResponse = await response.json()
      console.log(`✅ Got ${data.organic?.length || 0} results from Serper`)

      if (!data.organic || data.organic.length === 0) {
        console.log("⚠️ No organic results for this query")
        continue
      }

      for (const result of data.organic) {
        try {
          const { success, alreadyExists } = await insertJob({
            title: result.title,
            company: extractCompany(result.title, result.link),
            link: result.link,
            snippet: result.snippet || null,
            source: extractSource(result.link),
            searchQuery: query,
          })

          if (success && !alreadyExists) {
            totalInserted++
            console.log(`✅ Inserted: ${result.title}`)
          } else if (alreadyExists) {
            console.log(`📌 Already exists: ${result.title}`)
          } else {
            console.log(`❌ Failed to insert: ${result.title}`)
          }
        } catch (err) {
          console.error("❌ Error inserting job:", err)
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error(`❌ Failed to process query "${query}":`, err)
      errors.push(`Failed to process query "${query}": ${errorMsg}`)
    }
  }

  console.log(`✨ Scrape complete. Inserted ${totalInserted} jobs`)

  return NextResponse.json({
    success: true,
    queriesProcessed: SEARCH_QUERIES.length,
    jobsInserted: totalInserted,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  })
}
