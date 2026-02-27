import { expect, test } from "@playwright/test"

test("dashboard redirects to home when not authenticated", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()
  await page.goto(`${baseURL}/dashboard`)

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("button", { name: /sign in with github/i })).toBeVisible()
  await context.close()
})

test("dashboard loads with authenticated e2e session", async ({ page }) => {
  await page.goto("/dashboard")

  await expect(page).toHaveURL("/dashboard")
  await expect(page.getByRole("heading", { name: "JobFinder" })).toBeVisible()
})
