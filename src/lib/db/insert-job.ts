import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"

export type InsertJobParams = {
  title: string
  company: string | null
  link: string
  snippet: string | null
  source: string
  searchQuery: string
}

export type InsertJobResult = {
  success: boolean
  alreadyExists: boolean
}

export const insertJob = async (params: InsertJobParams): Promise<InsertJobResult> => {
  try {
    const result = await db
      .insert(jobs)
      .values({
        title: params.title,
        company: params.company,
        link: params.link,
        snippet: params.snippet,
        source: params.source,
        searchQuery: params.searchQuery,
      })
      .onConflictDoNothing({ target: jobs.link })
      .returning()

    if (result.length > 0) {
      return { success: true, alreadyExists: false }
    } else {
      return { success: true, alreadyExists: true }
    }
  } catch (err) {
    console.error("Failed to insert job", err)
    return { success: false, alreadyExists: false }
  }
}
