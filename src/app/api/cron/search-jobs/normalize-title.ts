export const normalizeJobTitle = (title: string, link: string): string => {
  try {
    const url = new URL(link)
    if (url.hostname.includes("greenhouse")) {
      return title.replace(/^Job Application for\s+/i, "").trim()
    }
  } catch {
    // Keep original title when URL parsing fails.
  }

  return title
}
