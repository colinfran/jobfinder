"use client"
import React, { FC, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export const AuthError: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    if (error) {
      let message = "Something went wrong."
      if (error === "access_denied") message = "You denied access."
      else if (errorDescription) message = decodeURIComponent(errorDescription.replace(/\+/g, " "))
      setErrorMessage(message)
      router.replace("/", { scroll: false })
    }
  }, [searchParams, router])

  if (!errorMessage) return null
  return <div className="text-red-700">{errorMessage}</div>
}
