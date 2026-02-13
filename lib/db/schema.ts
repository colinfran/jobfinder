import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  index,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core"

import { relations } from "drizzle-orm"

/* =========================
   USER
========================= */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  lastTopic: text("last_topic").default("software").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

/* =========================
   SESSION
========================= */

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userIdx: index("session_userId_idx").on(table.userId),
  }),
)

/* =========================
   ACCOUNT
========================= */

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdx: index("account_userId_idx").on(table.userId),
  }),
)

/* =========================
   VERIFICATION
========================= */

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  }),
)

/* =========================
   JOBS
========================= */

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company"),
  link: text("link").notNull().unique(),
  snippet: text("snippet"),
  source: text("source"),
  searchQuery: text("search_query"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* =========================
   USER JOBS (JOIN TABLE)
========================= */

export const userJobs = pgTable(
  "user_jobs",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    status: text("status").default("saved").notNull(),
    appliedAt: timestamp("applied_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.jobId] }),
    userIdx: index("user_jobs_user_idx").on(table.userId),
    jobIdx: index("user_jobs_job_idx").on(table.jobId),
  }),
)

/* =========================
   RELATIONS
========================= */

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  userJobs: many(userJobs),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const jobsRelations = relations(jobs, ({ many }) => ({
  userJobs: many(userJobs),
}))

export const userJobsRelations = relations(userJobs, ({ one }) => ({
  user: one(user, {
    fields: [userJobs.userId],
    references: [user.id],
  }),
  job: one(jobs, {
    fields: [userJobs.jobId],
    references: [jobs.id],
  }),
}))

/* =========================
   TYPES
========================= */

export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert

export type UserJob = typeof userJobs.$inferSelect
export type NewUserJob = typeof userJobs.$inferInsert
