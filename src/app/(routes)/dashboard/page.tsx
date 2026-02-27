import { db } from "@/lib/db"
import { jobs, user, userJobs } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { JobList } from "@/components/job-list/job-list"
import { TriggerButton } from "@/components/trigger-button"
import { FC } from "react"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { DEFAULT_TOPIC, TOPICS, TOPIC_BY_QUERY, type Topic } from "@/lib/config/search-queries"
import { JobListProvider } from "@/providers/job-list-provider"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

const Page: FC = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  if (!userId) {
    // redirect user back to home page if not authenticated
    // (this should be handled by the proxy, but this is an extra safeguard)
    redirect("/")
  }

  const userRow = await db
    .select({ lastTopic: user.lastTopic })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  const storedTopic = userRow[0]?.lastTopic as Topic | undefined
  const initialTopic = TOPICS.includes(storedTopic ?? DEFAULT_TOPIC)
    ? (storedTopic as Topic)
    : DEFAULT_TOPIC

  const rows = await db
    .select()
    .from(jobs)
    .leftJoin(userJobs, and(eq(userJobs.jobId, jobs.id), eq(userJobs.userId, userId)))
    .orderBy(desc(jobs.createdAt))

  const allJobs = rows.map((row) => ({
    ...row.jobs,
    applied: row.user_jobs?.status === "applied",
    notRelevant: row.user_jobs?.status === "not_relevant",
    topic: TOPIC_BY_QUERY[row.jobs.searchQuery ?? ""] ?? DEFAULT_TOPIC,
  }))

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">JobFinder</h1>
        </div>
        <TriggerButton />
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <JobListProvider initialTopic={initialTopic} jobs={allJobs} topics={[...TOPICS]}>
          <JobList />
        </JobListProvider>
      </main>
    </div>
  )
}

export default Page
