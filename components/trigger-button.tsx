"use client"

import { FC, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "./ui/spinner"
import { Button } from "./ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip"

export const TriggerButton: FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [hasTriggerSecret, setHasTriggerSecret] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const triggerSecret = localStorage.getItem("TRIGGER_SECRET")
    setHasTriggerSecret(!!triggerSecret)
  }, [])

  const handleScrape = async (): Promise<void> => {
    const triggerSecret = localStorage.getItem("TRIGGER_SECRET")
    if (!triggerSecret) {
      setResult("TRIGGER_SECRET not found in localStorage")
      return
    }

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

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
      {!hasTriggerSecret ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                className={`${loading || !hasTriggerSecret ? "cursor-not-allowed" : "cursor-pointer"}`}
                disabled={loading || !hasTriggerSecret}
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
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>TRIGGER_SECRET not set in localStorage</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button
          className={`${loading || !hasTriggerSecret ? "cursor-not-allowed" : "cursor-pointer"}`}
          disabled={loading || !hasTriggerSecret}
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
        </Button>
      )}
    </div>
  )
}
