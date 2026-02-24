import { expect, test } from "@playwright/test"

test("terms page renders", async ({ page }) => {
  await page.goto("/terms")

  await expect(page.getByRole("heading", { name: "Terms and Conditions" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible()
})
