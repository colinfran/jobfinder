"use client"

import { FC, useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "./ui/spinner"

export const TriggerScrapeButton: FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  const handleScrape = async (): Promise<void> => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/cron/scrape-jobs")
      const data = await res.json()
      if (data.success) {
        setResult(`Scraped ${data.jobsInserted} new jobs`)
        router.refresh()
      } else {
        setResult("Scrape failed")
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
      <button
        className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer"
        disabled={loading}
        onClick={handleScrape}
      >
        {loading ? (
          <>
            <Spinner />
            Scraping...
          </>
        ) : (
          "Scrape Now"
        )}
      </button>
    </div>
  )
}
