// Helper: check if link is an actual job posting
export const isValidJobLink = (link: string): boolean => {
  try {
    const url = new URL(link)
    const pathParts = url.pathname.split("/").filter(Boolean)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // Greenhouse: /jobs/<job-id> or /company-name/jobs/<job-id>
    if (url.hostname.includes("greenhouse")) {
      return pathParts.includes("jobs") && /\d+$/.test(pathParts[pathParts.length - 1])
    }

    // Lever: /company/<UUID>[/apply]
    if (url.hostname.includes("lever.co")) {
      return pathParts.length >= 2 && uuidRegex.test(pathParts[1])
    }

    // Ashby: /CompanyName/<UUID>[/application]
    if (url.hostname.includes("ashbyhq.com")) {
      return pathParts.length >= 2 && uuidRegex.test(pathParts[1])
    }

    // Workday: /.../job/<job-id>
    if (url.hostname.includes("myworkdayjobs.com")) {
      return pathParts.includes("job") && pathParts.length >= 2
    }

    return false
  } catch {
    return false
  }
}
