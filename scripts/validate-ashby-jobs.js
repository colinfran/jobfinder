#!/usr/bin/env node

import puppeteer from "puppeteer"

async function validateAshbyJobs() {
  const appUrl = process.env.APP_URL || "http://localhost:3000"
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error("❌ CRON_SECRET environment variable is not set")
    process.exit(1)
  }

  let browser

  try {
    console.log("🚀 Starting Ashby job validation")

    // Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    // Get all Ashby jobs from your API endpoint
    console.log("📊 Fetching Ashby jobs...")
    const jobsResponse = await fetch(`${appUrl}/api/ashby/get`, {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    })

    if (!jobsResponse.ok) {
      throw new Error(`Failed to fetch Ashby jobs: ${jobsResponse.statusText}`)
    }

    const { jobs } = await jobsResponse.json()
    console.log(`📋 Found ${jobs.length} Ashby jobs to validate`)

    const invalidJobIds = []

    // Process jobs in batches of 5 for concurrency
    const batchSize = 5
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (job) => {
          const page = await browser.newPage()
          page.setDefaultTimeout(10000)
          try {
            console.log(`🔍 Validating: ${job.title}`)

            try {
              const response = await page.goto(job.link, {
                waitUntil: "networkidle2",
              })

              // Check if the page contains "Job not found"
              const content = await page.content()
              if (
                !response || response.status() >= 400 ||
                content.includes("The job you requested was not found") ||
                content.includes("Job not found")
              ) {
                console.log(`❌ Invalid: ${job.title}`)
                invalidJobIds.push(job.id)
              } else {
                console.log(`✅ Valid: ${job.title}`)
              }
            } catch (err) {
              console.log(`⚠️ Error loading page: ${job.title}`)
            }
          } catch (err) {
            console.error(`Error validating job ${job.id}:`, err)
          } finally {
            await page.close()
          }
        }),
      )

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Send invalid job IDs to your API
    if (invalidJobIds.length > 0) {
      console.log(`\n🗑️ Removing ${invalidJobIds.length} invalid jobs`)

      const deleteResponse = await fetch(`${appUrl}/api/ashby/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({ invalidJobIds }),
      })

      if (!deleteResponse.ok) {
        throw new Error(
          `Failed to delete jobs: ${deleteResponse.statusText}`,
        )
      }

      const result = await deleteResponse.json()
      console.log(`✨ ${result.jobsRemoved} jobs removed`)
    } else {
      console.log("✨ All Ashby jobs are valid!")
    }
  } catch (err) {
    console.error("❌ Validation failed:", err)
    process.exit(1)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

validateAshbyJobs()
