import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core"

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company"),
  link: text("link").notNull().unique(),
  snippet: text("snippet"),
  source: text("source"),
  searchQuery: text("search_query"),
  applied: boolean("applied").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert
