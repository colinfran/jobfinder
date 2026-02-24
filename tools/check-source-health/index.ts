#!/usr/bin/env node
import { fileURLToPath } from "node:url"

export type JobSource = {
  name: string
  domain: string
  testUrl: string
}

type SourceHealthResult = {
  source: string
  healthy: boolean
  status?: number
  responseTime?: number
  error?: string
}

type CheckSourceHealthDeps = {
  fetchFn: typeof fetch
  now: () => number
}

type CheckAllSourcesDeps = {
  log: (message: string) => void
  check: (source: JobSource) => Promise<SourceHealthResult>
}

export const JOB_SOURCES: JobSource[] = [
  {
    name: "Greenhouse",
    domain: "greenhouse.io",
    testUrl: "https://boards.greenhouse.io/",
  },
  {
    name: "Lever",
    domain: "lever.co",
    testUrl: "https://jobs.lever.co/",
  },
  {
    name: "Ashby",
    domain: "ashbyhq.com",
    testUrl: "https://jobs.ashbyhq.com/",
  },
  {
    name: "Workday",
    domain: "myworkdayjobs.com",
    testUrl: "https://myworkdayjobs.com/",
  },
]

export async function checkSourceHealth(
  source: JobSource,
  deps: CheckSourceHealthDeps = {
    fetchFn: fetch,
    now: () => Date.now(),
  },
): Promise<SourceHealthResult> {
  const startTime = deps.now()

  try {
    const response = await deps.fetchFn(source.testUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    const responseTime = deps.now() - startTime

    return {
      source: source.name,
      healthy: response.ok,
      status: response.status,
      responseTime,
    }
  } catch (error) {
    const responseTime = deps.now() - startTime
    return {
      source: source.name,
      healthy: false,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkAllSources(
  sources: JobSource[] = JOB_SOURCES,
  deps: CheckAllSourcesDeps = {
    log: (message: string) => console.log(message),
    check: (source: JobSource) => checkSourceHealth(source),
  },
): Promise<boolean> {
  deps.log("🏥 Checking job source health...\n")

  const results = await Promise.all(sources.map((source) => deps.check(source)))

  let allHealthy = true

  for (const result of results) {
    const icon = result.healthy ? "✅" : "❌"
    const status = result.status ? `(${result.status})` : ""
    const time = result.responseTime ? `${result.responseTime}ms` : ""
    const error = result.error ? `- ${result.error}` : ""

    deps.log(`${icon} ${result.source.padEnd(15)} ${status.padEnd(6)} ${time.padEnd(8)} ${error}`)

    if (!result.healthy) {
      allHealthy = false
    }
  }

  deps.log(`\n${allHealthy ? "✨ All sources healthy!" : "⚠️  Some sources are down"}`)
  return allHealthy
}

export async function main(): Promise<void> {
  const allHealthy = await checkAllSources()
  if (!allHealthy) {
    process.exit(1)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  void main()
}
