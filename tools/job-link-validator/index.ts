import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { validateAshbyJobs } from "./sites/ashby/index"
import { validateGemJobs } from "./sites/gem/index"
import { validateWorkdayJobs } from "./sites/workday/index"

const currentDir = dirname(fileURLToPath(import.meta.url))
const rootEnvPath = resolve(currentDir, "../../.env")

type JobValidator = (appUrl: string, cronSecret: string) => Promise<void>

type ValidateJobsOptions = {
  env?: NodeJS.ProcessEnv
  validators?: {
    ashby: JobValidator
    workday: JobValidator
    gem: JobValidator
  }
  logger?: {
    log: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
  }
}

export function loadEnvIfNeeded(env: NodeJS.ProcessEnv = process.env): void {
  // Only load .env in development; in production (GitHub Actions), GITHUB_ACTIONS env var is set
  if (!env.GITHUB_ACTIONS) {
    process.loadEnvFile(rootEnvPath)
  }
}

export async function validateJobs(options: ValidateJobsOptions = {}): Promise<boolean> {
  const env = options.env ?? process.env
  const validators = options.validators ?? {
    ashby: validateAshbyJobs,
    workday: validateWorkdayJobs,
    gem: validateGemJobs,
  }
  const logger = options.logger ?? console

  const appUrl = env.APP_URL || "http://localhost:3000"
  const cronSecret = env.CRON_SECRET

  if (!cronSecret) {
    logger.error("❌ CRON_SECRET environment variable is not set")
    return false
  }

  try {
    logger.log("🚀 Starting job validation")

    // Validate Ashby jobs
    await validators.ashby(appUrl, cronSecret)

    // Validate Workday jobs
    await validators.workday(appUrl, cronSecret)

    // Validate Gem jobs
    await validators.gem(appUrl, cronSecret)

    logger.log("\n🎉 All validations complete!")
    return true
  } catch (err) {
    logger.error("❌ Validation failed:", err)
    return false
  }
}

export async function main(): Promise<void> {
  loadEnvIfNeeded()
  const ok = await validateJobs()
  if (!ok) {
    process.exit(1)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  void main()
}
