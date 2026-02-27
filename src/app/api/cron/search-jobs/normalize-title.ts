export const normalizeJobTitle = (title: string, link: string): string => {
  let normalizedTitle = title.trim()

  try {
    const url = new URL(link)
    if (url.hostname.includes("greenhouse")) {
      normalizedTitle = normalizedTitle.replace(/^Job Application for\s+/i, "").trim()
    }
  } catch {
    // Keep original title when URL parsing fails.
  }

  // Remove board suffixes commonly appended by search results.
  // Examples: "Senior Engineer - Jobs", "Role - Greenhouse", "Role - Lever", "Role - Gem".
  for (let i = 0; i < 3; i++) {
    const nextTitle = normalizedTitle
      .replace(/\s[-|–—]\s(?:jobs?)\.?$/i, "")
      .replace(/\s[-|–—]\s(?:greenhouse|lever|ashby|workday|gem|rippling)\.?$/i, "")
      .trim()

    if (nextTitle === normalizedTitle) break
    normalizedTitle = nextTitle
  }

  return normalizedTitle
}
