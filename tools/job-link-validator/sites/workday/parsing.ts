import type { WorkdayBoard, WorkdayPosting, WorkdayPostingIndex } from "./types"

export function normalizePath(path: string): string {
  const withoutQuery = path.split("?")[0]?.split("#")[0] ?? ""
  return withoutQuery.replace(/\/+$/, "").toLowerCase()
}

export function extractJobPathFromPath(path: string): string | null {
  const normalizedPath = normalizePath(path)
  const parts = normalizedPath.split("/").filter(Boolean)
  const jobIndex = parts.indexOf("job")
  if (jobIndex === -1) return null
  return normalizePath(`/${parts.slice(jobIndex).join("/")}`)
}

export function extractReqId(value: string): string | null {
  const decoded = decodeURIComponent(value)
  const match = decoded.match(
    /(?:_|\/|-)((?:r[-_ ]?\d{4,}|jr[-_ ]?\d{3,}|req[-_ ]?\d{3,}|job[-_ ]?\d{3,}|[a-z]{1,4}\d{5,}|\d{5,}))(?=$|[_/:\-?&#])/i,
  )
  if (!match) return null

  return match[1].replace(/[-_ ]+/g, "").toUpperCase()
}

export function extractBoardAndPaths(
  jobLink: string,
): (WorkdayBoard & { fullPath: string; jobPath: string | null }) | null {
  try {
    const url = new URL(jobLink)
    const hostParts = url.hostname.split(".")
    const tenant = hostParts[0]
    if (!tenant) return null

    const fullPath = normalizePath(url.pathname)
    if (!fullPath) return null

    const jobPath = extractJobPathFromPath(fullPath)
    if (!jobPath) return null

    const pathParts = fullPath.split("/").filter(Boolean)
    const jobIndex = pathParts.indexOf("job")
    const site = pathParts[jobIndex - 1]
    if (!site) return null

    return { origin: url.origin, tenant, site, fullPath, jobPath }
  } catch {
    return null
  }
}

export function buildPostingIndex(postings: WorkdayPosting[]): WorkdayPostingIndex {
  const byFullPathToPosting = new Map<string, WorkdayPosting>()
  const byJobPathToPosting = new Map<string, WorkdayPosting>()
  const byToken = new Map<string, WorkdayPosting>()

  for (const posting of postings) {
    if (!posting.externalPath) continue

    const normalizedFullPath = normalizePath(posting.externalPath)
    if (normalizedFullPath) {
      byFullPathToPosting.set(normalizedFullPath, posting)

      const jobPath = extractJobPathFromPath(normalizedFullPath)
      if (jobPath) {
        byJobPathToPosting.set(jobPath, posting)
      }
    }

    const token = extractReqId(posting.externalPath)
    if (token) byToken.set(token, posting)
  }

  return { byFullPathToPosting, byJobPathToPosting, byToken }
}
