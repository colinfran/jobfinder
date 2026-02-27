import { isGreenhouseJobPageValid } from "../greenhouse"
import { isLeverJobPageValid } from "../lever"
import { isRipplingJobPageValid } from "../rippling"

export type LinkValidationResult = {
  isValid: boolean
  reason:
    | "invalid-url"
    | "http-error"
    | "greenhouse-content-invalid"
    | "lever-content-invalid"
    | "rippling-content-invalid"
    | "validated"
    | "non-target-source"
    | "timeout"
    | "network-error"
  status?: number
}

type ValidateLinkOptions = {
  timeoutMs?: number
}

export const hasUnnecessarySuffix = (link: string): boolean => {
  try {
    const url = new URL(link)
    return /\/(application|apply)$/.test(url.pathname)
  } catch {
    return false
  }
}

export const validateLinkWithReason = async (
  link: string,
  options: ValidateLinkOptions = {},
): Promise<LinkValidationResult> => {
  const timeoutMs = options.timeoutMs ?? 5000

  let url: URL
  try {
    url = new URL(link)
  } catch {
    return { isValid: false, reason: "invalid-url" }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(link, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    clearTimeout(timeout)

    if (response.status >= 400) {
      return {
        isValid: false,
        reason: "http-error",
        status: response.status,
      }
    }

    const body = await response.text()

    if (url.hostname.includes("lever.co")) {
      const isValid = isLeverJobPageValid(body)
      return {
        isValid,
        reason: isValid ? "validated" : "lever-content-invalid",
      }
    }

    if (url.hostname.includes("greenhouse")) {
      const isValid = isGreenhouseJobPageValid(url, body)
      return {
        isValid,
        reason: isValid ? "validated" : "greenhouse-content-invalid",
      }
    }

    if (url.hostname.includes("ats.rippling.com")) {
      const isValid = isRipplingJobPageValid(body)
      return {
        isValid,
        reason: isValid ? "validated" : "rippling-content-invalid",
      }
    }

    // Workday + Ashby + Gem are validated by browser workflows.
    return { isValid: true, reason: "non-target-source" }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError"
    return {
      isValid: false,
      reason: isTimeout ? "timeout" : "network-error",
    }
  }
}

export const isLinkStillValid = async (link: string): Promise<boolean> => {
  const result = await validateLinkWithReason(link)
  return result.isValid
}
