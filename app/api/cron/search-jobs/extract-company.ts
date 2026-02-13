export const extractCompany = (title: string, link: string): string | null => {
  try {
    const url = new URL(link)
    const pathParts = url.pathname.split("/").filter(Boolean)

    if (url.hostname.includes("greenhouse")) {
      return pathParts[0]
        ? decodeURIComponent(pathParts[0])
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : null
    }

    if (url.hostname.includes("lever")) {
      return pathParts[0]
        ? decodeURIComponent(pathParts[0])
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : null
    }

    if (url.hostname.includes("ashbyhq")) {
      return pathParts[0]
        ? decodeURIComponent(pathParts[0])
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : null
    }

    if (url.hostname.includes("myworkdayjobs")) {
      return pathParts[0]
        ? decodeURIComponent(pathParts[0])
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : null
    }
  } catch {
    // fall through
  }

  const atMatch = title.match(/at\s+(.+?)(?:\s*[-|]|$)/i)
  if (atMatch) return atMatch[1].trim()

  return null
}
