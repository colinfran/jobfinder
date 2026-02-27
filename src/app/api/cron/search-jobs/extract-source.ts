export const extractSource = (link: string): string => {
  try {
    const url = new URL(link)
    const hostname = url.hostname.replace("www.", "")
    if (hostname.includes("greenhouse")) return "greenhouse.io"
    if (hostname.includes("lever")) return "lever.co"
    if (hostname.includes("ashbyhq")) return "ashbyhq.com"
    if (hostname.includes("myworkdayjobs")) return "myworkdayjobs.com"
    if (hostname.includes("gem.com")) return "gem.com"
    if (hostname.includes("rippling.com")) return "rippling.com"
    return hostname
  } catch {
    return "unknown"
  }
}
