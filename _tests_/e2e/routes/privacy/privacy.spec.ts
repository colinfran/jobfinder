import { expect, test } from "@playwright/test"

test("privacy page renders", async ({ page }) => {
  await page.goto("/privacy")

  await expect(page.getByRole("heading", { name: "Privacy Policy", exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible()
})
