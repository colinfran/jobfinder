import { authClient } from "@/lib/auth-client" //import the auth client

export const authenticate = async (): Promise<void> => {
  try {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
      errorCallbackURL: "/",
      newUserCallbackURL: "/dashboard",
    })
  } catch (error) {
    console.error(error)
  }
}

