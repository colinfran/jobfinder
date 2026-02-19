import puppeteer, { Browser } from "puppeteer"
import { validateAshbyJobs } from "./sites/ashby"
import { validateWorkdayJobs } from "./sites/workday"

async function validateJobs(): Promise<void> {
  const appUrl = process.env.APP_URL || "http://localhost:3000"
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error("❌ CRON_SECRET environment variable is not set")
    process.exit(1)
  }

  let browser: Browser | undefined

  try {
    console.log("🚀 Starting job validation")

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    // Validate Ashby jobs
    await validateAshbyJobs(appUrl, cronSecret, browser)

    // Validate Workday jobs
    await validateWorkdayJobs(appUrl, cronSecret, browser)

    console.log("\n🎉 All validations complete!")
  } catch (err) {
    console.error("❌ Validation failed:", err)
    process.exit(1)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

validateJobs()
