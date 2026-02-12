export const extractSource = (link: string): string => {
  try {
    const url = new URL(link)
    const hostname = url.hostname.replace("www.", "")
    if (hostname.includes("greenhouse")) return "greenhouse.io"
    if (hostname.includes("lever")) return "lever.co"
    if (hostname.includes("ashbyhq")) return "ashbyhq.com"
    return hostname
  } catch {
    return "unknown"
  }
}
