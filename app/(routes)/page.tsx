import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { JobList } from "@/components/job-list"
import { TriggerScrapeButton } from "@/components/trigger-scrape-button"
import { FC } from "react"

export const dynamic = "force-dynamic"

const Page: FC = async () => {
  const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt))

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Job Scraper</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {allJobs.length} jobs found across {new Set(allJobs.map((j) => j.source)).size} sources
          </p>
        </div>
        <TriggerScrapeButton />
      </header>
      <main>
        <JobList jobs={allJobs} />
      </main>
    </div>
  )
}

export default Page
