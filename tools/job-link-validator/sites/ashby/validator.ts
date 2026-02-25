import puppeteer, { type Browser } from "puppeteer"
import { deleteInvalidAshbyJobs, fetchAshbyJobs } from "./api"
import { extractAshbyLocation, isValidAshbyLocation } from "./location"
import { extractAshbyLocationFromPage, hasAshbyError } from "./page"
import type { LocationInfo } from "./types"

export async function validateAshbyJobs(appUrl: string, cronSecret: string): Promise<void> {
  console.log("\n🔷 Starting Ashby job validation")

  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const jobs = await fetchAshbyJobs(appUrl, cronSecret)
    console.log(`📋 Found ${jobs.length} Ashby jobs to validate`)

    const invalidJobIds: string[] = []
    const batchSize = 5

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (job) => {
          const page = await browser.newPage()
          page.setDefaultTimeout(10000)
          const markInvalid = (reason: string): void => {
            console.log(`❌ Invalid (${reason}): ${job.title}`)
            console.log(`   ↳ link=${job.link}`)
            invalidJobIds.push(job.id)
          }

          try {
            console.log(`🔍 Validating: ${job.title}`)

            try {
              const response = await page.goto(job.link, {
                waitUntil: "networkidle2",
              })

              try {
                await page.waitForSelector(".ashby-job-posting-left-pane", { timeout: 5000 })
              } catch {
                // Some pages load left pane asynchronously; fallback to current content.
              }

              const content = await page.content()
              const isHttpOk = response && response.status() < 400
              const hasError = hasAshbyError(content)

              if (!isHttpOk) {
                const status = response ? response.status() : "no-response"
                markInvalid(`http status ${status}`)
                return
              }

              if (hasError) {
                markInvalid("Ashby error page")
                return
              }

              let locationInfo: LocationInfo
              try {
                locationInfo = await extractAshbyLocationFromPage(page)
              } catch {
                locationInfo = extractAshbyLocation(content)
              }

              if (!locationInfo.location) {
                console.log(`⚠️ Unknown location, skipping removal: ${job.title}`)
                console.log(`   ↳ link=${job.link}`)
                return
              }

              if (!isValidAshbyLocation(locationInfo)) {
                const locationType = locationInfo.locationType ?? "unknown"
                markInvalid(
                  `location mismatch (location=${locationInfo.location}; type=${locationType})`,
                )
              } else {
                console.log(`✅ Valid: ${job.title}`)
              }
            } catch {
              markInvalid("page load error")
            }
          } catch (err) {
            console.error(`Error validating job ${job.id}:`, err)
          } finally {
            await page.close()
          }
        }),
      )

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (invalidJobIds.length > 0) {
      console.log(`\n🗑️ Removing ${invalidJobIds.length} invalid Ashby jobs`)
      const jobsRemoved = await deleteInvalidAshbyJobs(appUrl, cronSecret, invalidJobIds)
      console.log(`✨ ${jobsRemoved} Ashby jobs removed`)
    } else {
      console.log("✨ All Ashby jobs are valid!")
    }
  } finally {
    await browser.close()
  }
}
