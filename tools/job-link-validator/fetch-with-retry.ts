type Logger = {
  warn?: (...args: unknown[]) => void
}

type FetchWithRetryOptions = {
  maxAttempts?: number
  timeoutMs?: number
  baseDelayMs?: number
  requestLabel?: string
  retryStatuses?: number[]
  logger?: Logger
}

const DEFAULT_RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])
const DEFAULT_RETRYABLE_ERROR_CODES = new Set([
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "EHOSTUNREACH",
  "ENETUNREACH",
])

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function asErrorWithCode(value: unknown): { code?: unknown; cause?: unknown } {
  return typeof value === "object" && value !== null
    ? (value as { code?: unknown; cause?: unknown })
    : {}
}

function isRetryableError(error: unknown): boolean {
  const direct = asErrorWithCode(error)
  const nested = asErrorWithCode(direct.cause)

  const directCode = typeof direct.code === "string" ? direct.code : null
  const nestedCode = typeof nested.code === "string" ? nested.code : null

  return (
    (directCode !== null && DEFAULT_RETRYABLE_ERROR_CODES.has(directCode)) ||
    (nestedCode !== null && DEFAULT_RETRYABLE_ERROR_CODES.has(nestedCode))
  )
}

function isAbortTimeoutError(error: unknown): boolean {
  const err = error as { name?: unknown; message?: unknown } | undefined
  return (
    typeof err?.name === "string" &&
    err.name === "TimeoutError" &&
    typeof err.message === "string" &&
    err.message.toLowerCase().includes("aborted")
  )
}

export async function fetchWithRetry(
  input: string | URL | Request,
  init: RequestInit = {},
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const maxAttempts = options.maxAttempts ?? 3
  const timeoutMs = options.timeoutMs ?? 20_000
  const baseDelayMs = options.baseDelayMs ?? 500
  const requestLabel = options.requestLabel ?? "request"
  const retryStatuses = new Set(options.retryStatuses ?? [...DEFAULT_RETRYABLE_STATUSES])
  const logger = options.logger ?? console

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(input, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(timeoutMs),
      })

      if (retryStatuses.has(response.status) && attempt < maxAttempts) {
        const waitMs = baseDelayMs * 2 ** (attempt - 1)
        logger.warn?.(
          `Retrying ${requestLabel} after HTTP ${response.status} (attempt ${attempt}/${maxAttempts})`,
        )
        await sleep(waitMs)
        continue
      }

      return response
    } catch (error) {
      const retryable = isRetryableError(error) || isAbortTimeoutError(error)
      if (!retryable || attempt >= maxAttempts) {
        throw error
      }

      const waitMs = baseDelayMs * 2 ** (attempt - 1)
      logger.warn?.(
        `Retrying ${requestLabel} after network error (attempt ${attempt}/${maxAttempts})`,
        error,
      )
      await sleep(waitMs)
    }
  }

  throw new Error(`Unreachable retry state for ${requestLabel}`)
}
