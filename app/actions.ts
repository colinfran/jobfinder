"use server"

import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export const markAsApplied = async (jobId: number): Promise<void> => {
  await db.update(jobs).set({ applied: true }).where(eq(jobs.id, jobId))
  revalidatePath("/")
}

export const markAsUnapplied = async (jobId: number): Promise<void> => {
  await db.update(jobs).set({ applied: false }).where(eq(jobs.id, jobId))
  revalidatePath("/")
}
