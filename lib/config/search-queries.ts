export const TOPICS = ["software", "finance"] as const
export type Topic = (typeof TOPICS)[number]

export const DEFAULT_TOPIC: Topic = "software"

const SOFTWARE_QUERIES = [
  // Greenhouse - Frontend
  'site:greenhouse.io "frontend" "San Francisco" "hybrid"',
  'site:greenhouse.io "frontend" "San Francisco" "remote"',
  'site:greenhouse.io "front end" "San Francisco" "hybrid"',

  // Greenhouse - Full Stack
  'site:greenhouse.io "full stack" "San Francisco" "hybrid"',
  'site:greenhouse.io "full stack" "San Francisco" "remote"',
  'site:greenhouse.io "fullstack" "San Francisco" "hybrid"',

  // Lever - Frontend
  'site:lever.co "frontend" "San Francisco" "hybrid"',
  'site:lever.co "frontend" "San Francisco" "remote"',
  'site:lever.co "front end" "San Francisco" "hybrid"',


  // Lever - Full Stack
  'site:lever.co "full stack" "San Francisco" "hybrid"',
  'site:lever.co "full stack" "San Francisco" "remote"',
  'site:lever.co "fullstack" "San Francisco" "hybrid"',

  // Ashby - Frontend
  'site:ashbyhq.com "frontend" "San Francisco" "hybrid"',
  'site:ashbyhq.com "frontend" "San Francisco" "remote"',
  'site:ashbyhq.com "front end" "San Francisco" "hybrid"',

  // Ashby - Full Stack
  'site:ashbyhq.com "full stack" "San Francisco" "hybrid"',
  'site:ashbyhq.com "full stack" "San Francisco" "remote"',
  'site:ashbyhq.com "fullstack" "San Francisco" "hybrid"',


  // Workday - Frontend
  'site:myworkdayjobs.com "frontend" "San Francisco" "hybrid"',
  'site:myworkdayjobs.com "frontend" "San Francisco" "remote"',
  'site:myworkdayjobs.com "front end" "San Francisco" "hybrid"',

  // Workday - Full Stack
  'site:myworkdayjobs.com "full stack" "San Francisco" "hybrid"',
  'site:myworkdayjobs.com "full stack" "San Francisco" "remote"',
  'site:myworkdayjobs.com "fullstack" "San Francisco" "hybrid"',
]

const FINANCE_KEYWORDS = [
  "Finance",
  "Finance manager",
  "FP&A",
  "FP&A Manager",
  "Senior Financial Analyst",
  "Financial Analyst",
]

const FINANCE_QUERIES = [
  // Greenhouse - Finance
  ...FINANCE_KEYWORDS.flatMap((keyword) => [
    `site:greenhouse.io "${keyword}" "San Francisco" "hybrid"`,
    `site:greenhouse.io "${keyword}" "San Francisco" "in office"`,
    `site:greenhouse.io "${keyword}" "California" "remote"`,
    `site:greenhouse.io "${keyword}" "United States" "remote"`,
  ]),

  // Lever - Finance
  ...FINANCE_KEYWORDS.flatMap((keyword) => [
    `site:lever.co "${keyword}" "San Francisco" "hybrid"`,
    `site:lever.co "${keyword}" "San Francisco" "in office"`,
    `site:lever.co "${keyword}" "California" "remote"`,
    `site:lever.co "${keyword}" "United States" "remote"`,
  ]),

  // Ashby - Finance
  ...FINANCE_KEYWORDS.flatMap((keyword) => [
    `site:ashbyhq.com "${keyword}" "San Francisco" "hybrid"`,
    `site:ashbyhq.com "${keyword}" "San Francisco" "in office"`,
    `site:ashbyhq.com "${keyword}" "California" "remote"`,
    `site:ashbyhq.com "${keyword}" "United States" "remote"`,
  ]),

  // Workday - Finance
  ...FINANCE_KEYWORDS.flatMap((keyword) => [
    `site:myworkdayjobs.com "${keyword}" "San Francisco" "hybrid"`,
    `site:myworkdayjobs.com "${keyword}" "San Francisco" "in office"`,
    `site:myworkdayjobs.com "${keyword}" "California" "remote"`,
    `site:myworkdayjobs.com "${keyword}" "United States" "remote"`,
  ]),
]

export const SEARCH_QUERIES_BY_TOPIC: Record<Topic, string[]> = {
  software: SOFTWARE_QUERIES,
  finance: FINANCE_QUERIES,
}

export const SEARCH_QUERIES = Object.values(SEARCH_QUERIES_BY_TOPIC).flat()

export const TOPIC_BY_QUERY: Record<string, Topic> = Object.fromEntries(
  Object.entries(SEARCH_QUERIES_BY_TOPIC).flatMap(([topic, queries]) =>
    queries.map((query) => [query, topic as Topic]),
  ),
)
