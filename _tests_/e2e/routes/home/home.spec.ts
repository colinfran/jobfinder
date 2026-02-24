import { expect, test } from "@playwright/test"

test("home page renders sign-in when unauthenticated", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()
  await page.goto(`${baseURL}/`)

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("button", { name: /sign in with github/i })).toBeVisible()
  await context.close()
})

test("authenticated user visiting home is redirected to dashboard", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveURL("/dashboard")
  await expect(page.getByRole("heading", { name: "JobFinder" })).toBeVisible()
})
