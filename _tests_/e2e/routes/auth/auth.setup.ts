import { expect, test as setup } from "@playwright/test"
import { mkdir } from "node:fs/promises"

const authFile = "_tests_/e2e/.auth/user.json"
const testUser = {
  name: "E2E Test User",
  email: process.env.E2E_TEST_EMAIL ?? "e2e-test@jobfinder.local",
  password: process.env.E2E_TEST_PASSWORD ?? "jobfinder-e2e-password-123",
}

setup("authenticate test user", async ({ request }) => {
  await mkdir("_tests_/e2e/.auth", { recursive: true })

  let lastSignInError = ""

  const trySignIn = async (): Promise<boolean> => {
    const response = await request.post("/api/auth/sign-in/email", {
      data: {
        email: testUser.email,
        password: testUser.password,
      },
    })

    if (!response.ok()) {
      lastSignInError = `${response.status()} ${await response.text()}`
    }

    return response.ok()
  }

  let isAuthenticated = await trySignIn()

  if (!isAuthenticated) {
    const signUpResponse = await request.post("/api/auth/sign-up/email", {
      data: {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      },
    })

    if (signUpResponse.ok()) {
      // Better Auth signs users in on successful sign-up by default.
      isAuthenticated = true
    } else {
      // If sign-up fails (for example user already exists), retry sign-in.
      isAuthenticated = await trySignIn()
      expect(
        isAuthenticated,
        `Failed to authenticate e2e user. signUp=${signUpResponse.status()} ${await signUpResponse.text()} signIn=${lastSignInError}`,
      ).toBe(true)
    }

    expect(isAuthenticated, `Failed to sign in e2e user: ${lastSignInError}`).toBe(true)
  }

  await request.storageState({ path: authFile })
})
