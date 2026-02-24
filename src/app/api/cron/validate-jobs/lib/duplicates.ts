import { eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { normalizeJobUrl } from "../../search-jobs/normalize-url"

type DbJob = typeof jobs.$inferSelect

export const processDuplicateJobs = async (
  allJobs: DbJob[],
): Promise<{ duplicatesRemoved: number }> => {
  const urlMap = new Map<string, DbJob[]>()

  for (const job of allJobs) {
    const normalized = normalizeJobUrl(job.link)
    if (!urlMap.has(normalized)) {
      urlMap.set(normalized, [])
    }
    urlMap.get(normalized)?.push(job)
  }

  let duplicatesRemoved = 0
  const jobsToDelete: number[] = []
  const jobsToUpdate: Array<{ id: number; newLink: string; title: string }> = []

  for (const [normalizedUrl, jobGroup] of urlMap.entries()) {
    if (jobGroup.length > 1) {
      jobGroup.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      const jobToKeep = jobGroup[0]

      if (jobToKeep.link !== normalizedUrl) {
        jobsToUpdate.push({
          id: jobToKeep.id,
          newLink: normalizedUrl,
          title: jobToKeep.title,
        })
      }

      for (let i = 1; i < jobGroup.length; i++) {
        jobsToDelete.push(jobGroup[i].id)
        console.log(`🔀 Removing duplicate: ${jobGroup[i].title} (kept oldest with clean URL)`)
        duplicatesRemoved++
      }
    }
  }

  if (jobsToDelete.length > 0) {
    await db.delete(jobs).where(inArray(jobs.id, jobsToDelete))
  }

  for (const update of jobsToUpdate) {
    await db.update(jobs).set({ link: update.newLink }).where(eq(jobs.id, update.id))
    console.log(`🔗 Updated URL for: ${update.title}`)
  }

  return { duplicatesRemoved }
}
