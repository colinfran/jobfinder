// Helper: normalize job URLs to remove unnecessary suffixes
export const normalizeJobUrl = (link: string): string => {
  try {
    const url = new URL(link)
    // Remove trailing slash
    let pathname = url.pathname.replace(/\/$/, "")

    // Ashby: remove /application suffix
    if (url.hostname.includes("ashbyhq")) {
      pathname = pathname.replace(/\/application$/, "")
    }

    // Lever: remove /apply suffix
    if (url.hostname.includes("lever")) {
      pathname = pathname.replace(/\/apply$/, "")
    }

    // Reconstruct normalized URL
    return `${url.protocol}//${url.hostname}${pathname}`
  } catch {
    return link
  }
}
