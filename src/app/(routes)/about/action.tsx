import { SEARCH_QUERIES_BY_TOPIC } from "@/lib/config/search-queries"

const serperApiKey = process.env.SERPER_API_KEY

interface SerperDashboardResponse {
  creditBalance?: number
}

export const getCreditBalance = async (): Promise<number> => {
  if (!serperApiKey) {
    throw new Error("Missing SERPER_API_KEY")
  }

  const response = await fetch(`https://api.serper.dev/stats/dashboard?apiKey=${serperApiKey}`)

  if (!response.ok) {
    throw new Error(`Serper stats request failed: ${response.status}`)
  }

  const json = (await response.json()) as SerperDashboardResponse
  const balance = Number(json?.creditBalance ?? 0)

  const softwareQueries = SEARCH_QUERIES_BY_TOPIC.software.length
  const financeQueries = SEARCH_QUERIES_BY_TOPIC.finance.length
  const dailyQueryCost = (softwareQueries + financeQueries) * 2 // currently twice a day but should adjust to once a day after finding job
  const daysLeft = dailyQueryCost > 0 ? balance / dailyQueryCost : 0

  return Math.floor(daysLeft)
}
