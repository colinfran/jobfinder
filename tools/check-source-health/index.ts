#!/usr/bin/env node

type JobSource = {
  name: string
  domain: string
  testUrl: string
}

const JOB_SOURCES: JobSource[] = [
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

async function checkSourceHealth(source: JobSource): Promise<{
  source: string
  healthy: boolean
  status?: number
  responseTime?: number
  error?: string
}> {
  const startTime = Date.now()

  try {
    const response = await fetch(source.testUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    const responseTime = Date.now() - startTime

    return {
      source: source.name,
      healthy: response.ok,
      status: response.status,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      source: source.name,
      healthy: false,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function checkAllSources(): Promise<void> {
  console.log("🏥 Checking job source health...\n")

  const results = await Promise.all(JOB_SOURCES.map((source) => checkSourceHealth(source)))

  let allHealthy = true

  for (const result of results) {
    const icon = result.healthy ? "✅" : "❌"
    const status = result.status ? `(${result.status})` : ""
    const time = result.responseTime ? `${result.responseTime}ms` : ""
    const error = result.error ? `- ${result.error}` : ""

    console.log(
      `${icon} ${result.source.padEnd(15)} ${status.padEnd(6)} ${time.padEnd(8)} ${error}`,
    )

    if (!result.healthy) {
      allHealthy = false
    }
  }

  console.log(`\n${allHealthy ? "✨ All sources healthy!" : "⚠️  Some sources are down"}`)

  if (!allHealthy) {
    process.exit(1)
  }
}

checkAllSources()
