import puppeteer, { type Browser } from "puppeteer"
import { deleteInvalidGemJobs, fetchGemJobs } from "./api"
import { isValidGemLocation } from "./location"
import { extractGemLocationFromHtml, hasGemError } from "./page"

export async function validateGemJobs(appUrl: string, cronSecret: string): Promise<void> {
  console.log("\n💠 Starting Gem job validation")

  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const jobs = await fetchGemJobs(appUrl, cronSecret)
    console.log(`📋 Found ${jobs.length} Gem jobs to validate`)

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

              const content = await page.content()
              const isHttpOk = response && response.status() < 400
              const hasError = hasGemError(content)

              if (!isHttpOk) {
                const status = response ? response.status() : "no-response"
                markInvalid(`http status ${status}`)
                return
              }

              if (hasError) {
                markInvalid("Gem error page")
                return
              }

              const locationInfo = extractGemLocationFromHtml(content)

              if (!locationInfo.location) {
                console.log(`⚠️ Unknown location, skipping removal: ${job.title}`)
                console.log(`   ↳ link=${job.link}`)
                return
              }

              if (!isValidGemLocation(locationInfo)) {
                const workplaceType = locationInfo.workplaceType ?? "unknown"
                markInvalid(
                  `location mismatch (location=${locationInfo.location}; type=${workplaceType})`,
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
      console.log(`\n🗑️ Removing ${invalidJobIds.length} invalid Gem jobs`)
      const jobsRemoved = await deleteInvalidGemJobs(appUrl, cronSecret, invalidJobIds)
      console.log(`✨ ${jobsRemoved} Gem jobs removed`)
    } else {
      console.log("✨ All Gem jobs are valid!")
    }
  } finally {
    await browser.close()
  }
}
