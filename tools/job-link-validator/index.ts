import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { validateAshbyJobs } from "./sites/ashby/index"
import { validateWorkdayJobs } from "./sites/workday/index"

const currentDir = dirname(fileURLToPath(import.meta.url))
const rootEnvPath = resolve(currentDir, "../../.env")
// Only load .env in development; in production (GitHub Actions), GITHUB_ACTIONS env var is set
if (!process.env.GITHUB_ACTIONS) {
  process.loadEnvFile(rootEnvPath)
}

async function validateJobs(): Promise<void> {
  const appUrl = process.env.APP_URL || "http://localhost:3000"
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error("❌ CRON_SECRET environment variable is not set")
    process.exit(1)
  }

  try {
    console.log("🚀 Starting job validation")

    // Validate Ashby jobs
    await validateAshbyJobs(appUrl, cronSecret)

    // Validate Workday jobs
    await validateWorkdayJobs(appUrl, cronSecret)

    console.log("\n🎉 All validations complete!")
  } catch (err) {
    console.error("❌ Validation failed:", err)
    process.exit(1)
  }
}

validateJobs()
