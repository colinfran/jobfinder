import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}

export const getNextCronRun = (): Date => {
  // Cron: "0 0,12 * * *" - runs at UTC 0 and 12
  const now = new Date()
  const next = new Date(now)
  const currentUtcHour = now.getUTCHours()

  if (currentUtcHour < 12) {
    // Next run is at 12:00 UTC today
    next.setUTCHours(12, 0, 0, 0)
  } else {
    // Next run is at 00:00 UTC tomorrow
    next.setUTCDate(next.getUTCDate() + 1)
    next.setUTCHours(0, 0, 0, 0)
  }

  return next
}

export const formatTimeRemaining = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  const pad = (n: number): string => n.toString().padStart(2, "0")
  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
  }
  if (minutes > 0) {
    return `${pad(minutes)}m ${pad(seconds)}s`
  }
  return `${pad(seconds)}s`
}
