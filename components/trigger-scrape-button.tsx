"use client"

import { FC, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "./ui/spinner"
import { Button } from "./ui/button"

export const TriggerScrapeButton: FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [hasCronSecret, setHasCronSecret] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const cronSecret = localStorage.getItem("CRON_SECRET")
    setHasCronSecret(!!cronSecret)
  }, [])

  const handleScrape = async (): Promise<void> => {
    const cronSecret = localStorage.getItem("CRON_SECRET")
    if (!cronSecret) {
      setResult("CRON_SECRET not found in localStorage")
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/cron/scrape-jobs", {
        headers: {
          Authorization: `Bearer ${cronSecret}`,
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

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
      <Button
        className={`${loading || !hasCronSecret ? "cursor-not-allowed" : "cursor-pointer"}`}
        disabled={loading || !hasCronSecret}
        onClick={handleScrape}
        title={!hasCronSecret ? "CRON_SECRET not set in localStorage" : ""}
      >
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
