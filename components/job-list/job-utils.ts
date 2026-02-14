export const timeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export const sourceColor = (source: string): string => {
  switch (source) {
    case "greenhouse.io":
      return "bg-teal-500/15 text-teal-600"
    case "lever.co":
      return "bg-gray-100/15 text-gray-400"
    case "ashbyhq.com":
      return "bg-violet-500/15 text-violet-600"
    case "myworkdayjobs.com":
      return "bg-blue-500/15 text-blue-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}
