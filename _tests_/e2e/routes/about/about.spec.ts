import { expect, test } from "@playwright/test"

test("about page renders", async ({ page }) => {
  await page.goto("/about")

  await expect(page.getByRole("heading", { name: "JobFinder" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Built by Colin Franceschini" })).toBeVisible()
})
