import { extractSource } from "@/app/api/cron/search-jobs/extract-source"
import { extractCompany } from "@/app/api/cron/search-jobs/extract-company"
import { insertJob } from "@/lib/db/insert-job"
import { isValidJobLink } from "./is-valid-job-link"
import { normalizeJobUrl } from "./normalize-url"
import { normalizeJobTitle } from "./normalize-title"
import { isLinkStillValid } from "@/app/api/cron/validate-jobs/validate-job-link"
import type { Topic } from "@/lib/config/search-queries"

interface SerperOrganicResult {
  title: string
  link: string
  snippet: string
  position: number
}

interface SerperResponse {
  organic: SerperOrganicResult[]
}

// Fetch search results from Serper API
export const fetchSerperResults = async (query: string): Promise<SerperOrganicResult[]> => {
  const serperApiKey = process.env.SERPER_API_KEY!

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
    throw new Error(`Serper API error: ${response.status} - ${errorText}`)
  }

  const data: SerperResponse = await response.json()
  console.log(`✅ Got ${data.organic?.length || 0} results from Serper`)

  return data.organic || []
}

// Process a single job result
export const processJobResult = async (
  result: SerperOrganicResult,
  query: string,
  topic: Topic,
): Promise<{
  success: boolean
  inserted: boolean
  alreadyExists: boolean
  title: string
}> => {
  const normalizedTitle = normalizeJobTitle(result.title, result.link)

  if (!isValidJobLink(result.link)) {
    console.log(`⚠️ Skipping non-job link: ${result.link}`)
    return { success: false, inserted: false, alreadyExists: false, title: normalizedTitle }
  }

  // Validate that the link is still active before inserting
  const isValid = await isLinkStillValid(result.link)
  if (!isValid) {
    console.log(`⚠️ Skipping dead link: ${result.link}`)
    return { success: false, inserted: false, alreadyExists: false, title: normalizedTitle }
  }

  try {
    const { success, alreadyExists } = await insertJob({
      title: normalizedTitle,
      company: extractCompany(normalizedTitle, result.link),
      link: normalizeJobUrl(result.link),
      snippet: result.snippet || null,
      source: extractSource(result.link),
      topic,
      searchQuery: query,
    })

    if (success && !alreadyExists) {
      console.log(`✅ Inserted: ${normalizedTitle}`)
      return { success: true, inserted: true, alreadyExists: false, title: normalizedTitle }
    } else if (alreadyExists) {
      console.log(`📌 Already exists: ${normalizedTitle}`)
      return { success: true, inserted: false, alreadyExists: true, title: normalizedTitle }
    } else {
      console.log(`❌ Failed to insert: ${normalizedTitle}`)
      return { success: false, inserted: false, alreadyExists: false, title: normalizedTitle }
    }
  } catch (err) {
    console.error("❌ Error inserting job:", err)
    return { success: false, inserted: false, alreadyExists: false, title: normalizedTitle }
  }
}

// Process all results for a single search query
export const processSearchQuery = async (
  query: string,
  topic: Topic,
): Promise<{
  inserted: number
  errors: string[]
}> => {
  console.log(`🔍 Processing query: ${query}`)

  try {
    const results = await fetchSerperResults(query)

    if (results.length === 0) {
      console.log("⚠️ No organic results for this query")
      return { inserted: 0, errors: [] }
    }

    let inserted = 0
    for (const result of results) {
      const { success, inserted: wasInserted } = await processJobResult(result, query, topic)
      if (success && wasInserted) {
        inserted++
      }
    }

    return { inserted, errors: [] }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error"
    console.error(`❌ Failed to process query "${query}":`, err)
    return { inserted: 0, errors: [`Failed to process query "${query}": ${errorMsg}`] }
  }
}
