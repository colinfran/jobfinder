import { defineConfig, devices } from "@playwright/test"
import path from "node:path"

const e2eDir = path.resolve(process.cwd(), "_tests_/e2e")
const e2eAuthFile = path.join(e2eDir, ".auth/user.json")

export default defineConfig({
  testDir: "./e2e",
  outputDir: path.join(e2eDir, "test-results"),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: path.join(e2eDir, "report"), open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: e2eAuthFile,
      },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    command: "E2E_AUTH_BYPASS=true npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
})
