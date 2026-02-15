"use server"

import { db } from "@/lib/db"
import { user, userJobs } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/auth"
import { DEFAULT_TOPIC, TOPICS, type Topic } from "@/lib/config/search-queries"

export const markAsApplied = async (jobId: number): Promise<void> => {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  await db
    .insert(userJobs)
    .values({ userId, jobId, status: "applied", appliedAt: new Date() })
    .onConflictDoUpdate({
      target: [userJobs.userId, userJobs.jobId],
      set: { status: "applied", appliedAt: new Date() },
    })

  revalidatePath("/dashboard")
}

export const markAsUnapplied = async (jobId: number): Promise<void> => {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  await db.delete(userJobs).where(and(eq(userJobs.userId, userId), eq(userJobs.jobId, jobId)))
  revalidatePath("/dashboard")
}

export const markAsNotRelevant = async (jobId: number): Promise<void> => {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Check current status
  const existing = await db
    .select({ status: userJobs.status })
    .from(userJobs)
    .where(and(eq(userJobs.userId, userId), eq(userJobs.jobId, jobId)))
    .limit(1)

  const currentStatus = existing[0]?.status
  const newStatus = currentStatus === "not_relevant" ? "saved" : "not_relevant"

  await db
    .insert(userJobs)
    .values({ userId, jobId, status: newStatus })
    .onConflictDoUpdate({
      target: [userJobs.userId, userJobs.jobId],
      set: { status: newStatus },
    })

  revalidatePath("/dashboard")
}

export const setLastViewedTopic = async (topic: Topic): Promise<void> => {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const nextTopic = TOPICS.includes(topic) ? topic : DEFAULT_TOPIC
  await db.update(user).set({ lastTopic: nextTopic }).where(eq(user.id, userId))
}
