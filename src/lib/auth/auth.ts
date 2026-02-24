import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../db"

const isE2ETestMode = process.env.E2E_AUTH_BYPASS === "true"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  ...(isE2ETestMode
    ? {
        emailAndPassword: {
          enabled: true,
          requireEmailVerification: false,
        },
      }
    : {}),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
})
