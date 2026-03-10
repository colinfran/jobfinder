"use client"

import { FC, useEffect, useRef } from "react"
import { toast } from "sonner"

const SIX_HOURS_MS = 6 * 60 * 60 * 1000
const STORAGE_KEY = "donate-toast-last-shown"
const DEFAULT_DESCRIPTION = "Consider donating to help us keep JobFinder running."

type CreditBadgeResponse = {
  daysLeft?: number | null
  isAdmin?: boolean
}

const getDonateToastData = async (): Promise<{ isAdmin: boolean; description: string }> => {
  try {
    const response = await fetch("/api/donate-toast-data", {
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        isAdmin: false,
        description: DEFAULT_DESCRIPTION,
      }
    }

    const json = (await response.json()) as CreditBadgeResponse
    const daysFromMessage = json.daysLeft
    const isAdmin = Boolean(json.isAdmin)

    if (!Number.isFinite(daysFromMessage)) {
      return {
        isAdmin,
        description: DEFAULT_DESCRIPTION,
      }
    }

    return {
      isAdmin,
      description: `Only about ${daysFromMessage} days of Serper API credits remain. Please consider donating to keep JobFinder running.`,
    }
  } catch {
    return {
      isAdmin: false,
      description: DEFAULT_DESCRIPTION,
    }
  }
}

export const DonateToast: FC = () => {
  const toastIdRef = useRef<string | number | null>(null)

  useEffect(() => {
    const checkAndShowToast = async (): Promise<void> => {
      const { isAdmin, description } = await getDonateToastData()

      if (isAdmin) {
        return
      }

      const lastShown = localStorage.getItem(STORAGE_KEY)
      const now = Date.now()

      const shouldShow = !lastShown || now - parseInt(lastShown, 10) >= SIX_HOURS_MS

      // Only show if we should and there's no existing toast
      if (shouldShow && !toastIdRef.current) {
        if (toastIdRef.current) {
          return
        }

        toastIdRef.current = toast("Support JobFinder", {
          description,
          closeButton: true,
          duration: Infinity,
          action: {
            label: "Donate now",
            onClick: () => {
              localStorage.setItem(STORAGE_KEY, Date.now().toString())
              window.location.assign("/about#support-jobfinder")
            },
          },
          onDismiss: () => {
            localStorage.setItem(STORAGE_KEY, Date.now().toString())
            toastIdRef.current = null
          },
        })
      }
    }

    // Check on mount
    void checkAndShowToast()

    // Set up interval to check every minute (in case tab stays open)
    const interval = setInterval(() => {
      void checkAndShowToast()
    }, 60 * 1000)

    return () => {
      clearInterval(interval)
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
      }
    }
  }, [])

  return null
}
