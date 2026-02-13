"use client"

import React, { FC, Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Github, Loader2 } from "lucide-react"
import Link from "next/link"
import Icon from "@/components/icon"
import { authenticate } from "@/lib/db/authenticate"
import { AuthError } from "@/components/auth-error"

const Page: FC = () => {
  const [loading, setLoading] = useState(false)

  const onSubmit = (): void => {
    setLoading(true)
    authenticate()
  }

  return (
    <div className="mx-[2px] flex flex-col items-start p-8 md:items-center">
      <div className="flex w-full justify-center">
        <Icon size={108} />
      </div>

      <h1 className="mb-6 w-full text-center text-3xl font-bold">JobFinder</h1>

      <h3 className="mx-auto mb-6 max-w-[400px] text-center">
        JobFinder is a personal job discovery engine that helps me automatically find and organize
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

          <Button
            className="flex w-full cursor-pointer gap-2"
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Github size={16} />}
            <span>Sign in with GitHub</span>
          </Button>

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
