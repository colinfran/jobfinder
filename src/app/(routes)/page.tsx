"use client"

import React, { FC, Suspense, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import Icon from "@/components/icon"
import { authenticate } from "@/lib/auth/auth-client"
import { AuthError } from "@/components/auth-error"
import { BrandIcon } from "@/components/brand-icons"

const Page: FC = () => {
  const [loadingProvider, setLoadingProvider] = useState<"github" | "google" | null>(null)
  const isAuthenticatingRef = useRef(false)

  const onSubmit = async (brand: "github" | "google"): Promise<void> => {
    if (isAuthenticatingRef.current) return

    isAuthenticatingRef.current = true
    setLoadingProvider(brand)

    await authenticate(brand)

    // If sign-in does not redirect (e.g. popup blocked/network issue), unlock the buttons.
    isAuthenticatingRef.current = false
    setLoadingProvider(null)
  }

  const isAuthenticating = loadingProvider !== null

  return (
    <div className="mx-[2px] flex flex-col items-start p-8 md:items-center">
      <div className="flex w-full justify-center">
        <Icon size={108} />
      </div>

      <h1 className="mb-6 w-full text-center text-3xl font-bold">JobFinder</h1>

      <h3 className="mx-auto mb-6 max-w-[400px] text-center">
        JobFinder is a personal job discovery engine that helps automatically find and organize
        relevant roles across the web. Instead of manually checking multiple job boards, everything
        is surfaced and structured in one focused dashboard.
      </h3>

      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardDescription className="text-center">
            Sign in to access your personalized job dashboard, track opportunities, and manage your
            application workflow in one place.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col">
          {/* Display authentication errors */}
          <Suspense fallback={null}>
            <AuthError />
          </Suspense>

          <div className="flex flex-col gap-2 w-full">
            <Button
              className="flex w-full cursor-pointer gap-4"
              disabled={isAuthenticating}
              onClick={() => {
                void onSubmit("google")
              }}
            >
              {loadingProvider === "google" ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <BrandIcon brand="google" />
              )}
              <span>Sign in with Google</span>
            </Button>
            <Button
              className="flex w-full cursor-pointer gap-4"
              disabled={isAuthenticating}
              onClick={() => {
                void onSubmit("github")
              }}
            >
              {loadingProvider === "github" ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <BrandIcon brand="github" />
              )}
              <span>Sign in with GitHub</span>
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By logging in, you agree to our
            <br />
            <Link className="underline" href="/terms" prefetch>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link className="underline" href="/privacy" prefetch>
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Page
