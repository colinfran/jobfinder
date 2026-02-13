"use client"

import { FC, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "./ui/spinner"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { getNextCronRun, formatTimeRemaining } from "@/lib/utils"

export const TriggerButton: FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [hasTriggerSecret, setHasTriggerSecret] = useState(false)
  const [timeToNextRun, setTimeToNextRun] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const triggerSecret = localStorage.getItem("TRIGGER_SECRET")
    setHasTriggerSecret(!!triggerSecret)
  }, [])

  useEffect(() => {
    if (hasTriggerSecret) return

    const updateCountdown = (): void => {
      const next = getNextCronRun()
      const now = new Date()
      const remaining = next.getTime() - now.getTime()
      setTimeToNextRun(formatTimeRemaining(remaining))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000) // Update every second

    return () => clearInterval(interval)
  }, [hasTriggerSecret])

  const handleScrape = async (): Promise<void> => {
    const triggerSecret = localStorage.getItem("TRIGGER_SECRET")
    if (!triggerSecret) return

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/cron/scrape-jobs", {
        headers: {
          Authorization: `Bearer ${triggerSecret}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setResult(`Scraped ${data.jobsInserted} new jobs`)
        router.refresh()
      } else {
        setResult(data.error || "Scrape failed")
      }
    } catch {
      setResult("Error triggering scrape")
    } finally {
      setLoading(false)
    }
  }

  if (!hasTriggerSecret) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Next scrape in</span>
        {timeToNextRun ? (
          <span className="font-medium tabular-nums">{timeToNextRun}</span>
        ) : (
          <Skeleton className="h-5 w-16" />
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
      <Button className="cursor-pointer" disabled={loading} onClick={handleScrape}>
        {loading ? (
          <>
            <Spinner />
            Scraping...
          </>
        ) : (
          "Scrape Now"
        )}
      </Button>
    </div>
  )
}
