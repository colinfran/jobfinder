export const triggerGitHubActionValidation = async (): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const githubToken = process.env.GITHUB_TOKEN

    if (!githubToken) {
      console.warn("⚠️ GITHUB_TOKEN not set, skipping GitHub Actions trigger")
      return { success: false, message: "GITHUB_TOKEN not configured" }
    }

    const dispatchUrl = "https://api.github.com/repos/colinfran/jobfinder/dispatches"

    const response = await fetch(dispatchUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        event_type: "validate-jobs",
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`❌ GitHub API error: ${response.status} ${response.statusText}`)
      console.error(`Error details: ${errorBody}`)
      return { success: false, message: `GitHub API returned ${response.status}` }
    }

    console.log("✅ Successfully triggered GitHub Actions validate-jobs workflow")
    return { success: true, message: "Workflow triggered successfully" }
  } catch (error) {
    console.error(
      "❌ Error triggering GitHub Actions:",
      error instanceof Error ? error.message : error,
    )
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}
