import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})

export const authenticate = async (brand: "github" | "google"): Promise<void> => {
  try {
    await authClient.signIn.social({
      provider: brand,
      callbackURL: "/dashboard",
      errorCallbackURL: "/",
      newUserCallbackURL: "/dashboard",
    })
  } catch (error) {
    console.error(error)
  }
}

export const signOut = async (setLoading: (loading: boolean) => void): Promise<void> => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        console.log("Signed out successfully")
        window.location.replace("/")
        setLoading(false)
      },
      onError: () => {
        console.log("Error signing out")
        setLoading(false)
      },
    },
  })
}
