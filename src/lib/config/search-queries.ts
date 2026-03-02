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

  // Gem - Frontend
  'site:jobs.gem.com "frontend" "San Francisco" "hybrid"',
  'site:jobs.gem.com "frontend" "San Francisco" "remote"',
  'site:jobs.gem.com "front end" "San Francisco" "hybrid"',

  // Gem - Full Stack
  'site:jobs.gem.com "full stack" "San Francisco" "hybrid"',
  'site:jobs.gem.com "full stack" "San Francisco" "remote"',
  'site:jobs.gem.com "fullstack" "San Francisco" "hybrid"',

  // Rippling - Frontend
  'site:ats.rippling.com "frontend" "San Francisco" "hybrid"',
  'site:ats.rippling.com "frontend" "San Francisco" "remote"',
  'site:ats.rippling.com "front end" "San Francisco" "hybrid"',

  // Rippling - Full Stack
  'site:ats.rippling.com "full stack" "San Francisco" "hybrid"',
  'site:ats.rippling.com "full stack" "San Francisco" "remote"',
  'site:ats.rippling.com "fullstack" "San Francisco" "hybrid"',
]

const FINANCE_QUERIES = [
  // Greenhouse - Financial Analyst
  'site:greenhouse.io "Financial Analyst" "San Francisco" "hybrid"',
  'site:greenhouse.io "Financial Analyst" "San Francisco" "remote"',
  'site:greenhouse.io "Financial Analyst" "United States" "remote"',

  // Greenhouse - Senior Financial Analyst
  'site:greenhouse.io "Senior Financial Analyst" "San Francisco" "hybrid"',
  'site:greenhouse.io "Senior Financial Analyst" "San Francisco" "remote"',
  'site:greenhouse.io "Senior Financial Analyst" "United States" "remote"',

  // Greenhouse - Finance Manager
  'site:greenhouse.io "Finance Manager" "San Francisco" "hybrid"',
  'site:greenhouse.io "Finance Manager" "San Francisco" "remote"',
  'site:greenhouse.io "Finance Manager" "United States" "remote"',

  // Greenhouse - FP&A
  'site:greenhouse.io "FP&A" "San Francisco" "hybrid"',
  'site:greenhouse.io "FP&A" "San Francisco" "remote"',
  'site:greenhouse.io "FP&A" "United States" "remote"',

  // Greenhouse - Financial Planning & Analysis
  'site:greenhouse.io "Financial Planning & Analysis" "San Francisco" "hybrid"',
  'site:greenhouse.io "Financial Planning & Analysis" "San Francisco" "remote"',
  'site:greenhouse.io "Financial Planning & Analysis" "United States" "remote"',

  // Lever - Financial Analyst
  'site:lever.co "Financial Analyst" "San Francisco" "hybrid"',
  'site:lever.co "Financial Analyst" "San Francisco" "remote"',
  'site:lever.co "Financial Analyst" "United States" "remote"',

  // Lever - Senior Financial Analyst
  'site:lever.co "Senior Financial Analyst" "San Francisco" "hybrid"',
  'site:lever.co "Senior Financial Analyst" "San Francisco" "remote"',
  'site:lever.co "Senior Financial Analyst" "United States" "remote"',

  // Lever - Finance Manager
  'site:lever.co "Finance Manager" "San Francisco" "hybrid"',
  'site:lever.co "Finance Manager" "San Francisco" "remote"',
  'site:lever.co "Finance Manager" "United States" "remote"',

  // Lever - FP&A
  'site:lever.co "FP&A" "San Francisco" "hybrid"',
  'site:lever.co "FP&A" "San Francisco" "remote"',
  'site:lever.co "FP&A" "United States" "remote"',

  // Lever - Financial Planning & Analysis
  'site:lever.co "Financial Planning & Analysis" "San Francisco" "hybrid"',
  'site:lever.co "Financial Planning & Analysis" "San Francisco" "remote"',
  'site:lever.co "Financial Planning & Analysis" "United States" "remote"',

  // Ashby - Financial Analyst
  'site:ashbyhq.com "Financial Analyst" "San Francisco" "hybrid"',
  'site:ashbyhq.com "Financial Analyst" "San Francisco" "remote"',
  'site:ashbyhq.com "Financial Analyst" "United States" "remote"',

  // Ashby - Senior Financial Analyst
  'site:ashbyhq.com "Senior Financial Analyst" "San Francisco" "hybrid"',
  'site:ashbyhq.com "Senior Financial Analyst" "San Francisco" "remote"',
  'site:ashbyhq.com "Senior Financial Analyst" "United States" "remote"',

  // Ashby - Finance Manager
  'site:ashbyhq.com "Finance Manager" "San Francisco" "hybrid"',
  'site:ashbyhq.com "Finance Manager" "San Francisco" "remote"',
  'site:ashbyhq.com "Finance Manager" "United States" "remote"',

  // Ashby - FP&A
  'site:ashbyhq.com "FP&A" "San Francisco" "hybrid"',
  'site:ashbyhq.com "FP&A" "San Francisco" "remote"',
  'site:ashbyhq.com "FP&A" "United States" "remote"',

  // Ashby - Financial Planning & Analysis
  'site:ashbyhq.com "Financial Planning & Analysis" "San Francisco" "hybrid"',
  'site:ashbyhq.com "Financial Planning & Analysis" "San Francisco" "remote"',
  'site:ashbyhq.com "Financial Planning & Analysis" "United States" "remote"',

  // Workday - Financial Analyst
  'site:myworkdayjobs.com "Financial Analyst" "San Francisco" "hybrid"',
  'site:myworkdayjobs.com "Financial Analyst" "San Francisco" "remote"',
  'site:myworkdayjobs.com "Financial Analyst" "United States" "remote"',

  // Workday - Senior Financial Analyst
  'site:myworkdayjobs.com "Senior Financial Analyst" "San Francisco" "hybrid"',
  'site:myworkdayjobs.com "Senior Financial Analyst" "San Francisco" "remote"',
  'site:myworkdayjobs.com "Senior Financial Analyst" "United States" "remote"',

  // Workday - Finance Manager
  'site:myworkdayjobs.com "Finance Manager" "San Francisco" "hybrid"',
  'site:myworkdayjobs.com "Finance Manager" "San Francisco" "remote"',
  'site:myworkdayjobs.com "Finance Manager" "United States" "remote"',

  // Workday - FP&A
  'site:myworkdayjobs.com "FP&A" "San Francisco" "hybrid"',
  'site:myworkdayjobs.com "FP&A" "San Francisco" "remote"',
  'site:myworkdayjobs.com "FP&A" "United States" "remote"',

  // Workday - Financial Planning & Analysis
  'site:myworkdayjobs.com "Financial Planning & Analysis" "San Francisco" "hybrid"',
  'site:myworkdayjobs.com "Financial Planning & Analysis" "San Francisco" "remote"',
  'site:myworkdayjobs.com "Financial Planning & Analysis" "United States" "remote"',

  // Gem - Financial Analyst
  'site:jobs.gem.com "Financial Analyst" "San Francisco" "hybrid"',
  'site:jobs.gem.com "Financial Analyst" "San Francisco" "remote"',
  'site:jobs.gem.com "Financial Analyst" "United States" "remote"',

  // Gem - Senior Financial Analyst
  'site:jobs.gem.com "Senior Financial Analyst" "San Francisco" "hybrid"',
  'site:jobs.gem.com "Senior Financial Analyst" "San Francisco" "remote"',
  'site:jobs.gem.com "Senior Financial Analyst" "United States" "remote"',

  // Gem - Finance Manager
  'site:jobs.gem.com "Finance Manager" "San Francisco" "hybrid"',
  'site:jobs.gem.com "Finance Manager" "San Francisco" "remote"',
  'site:jobs.gem.com "Finance Manager" "United States" "remote"',

  // Gem - FP&A
  'site:jobs.gem.com "FP&A" "San Francisco" "hybrid"',
  'site:jobs.gem.com "FP&A" "San Francisco" "remote"',
  'site:jobs.gem.com "FP&A" "United States" "remote"',

  // Gem - Financial Planning & Analysis
  'site:jobs.gem.com "Financial Planning & Analysis" "San Francisco" "hybrid"',
  'site:jobs.gem.com "Financial Planning & Analysis" "San Francisco" "remote"',
  'site:jobs.gem.com "Financial Planning & Analysis" "United States" "remote"',

  // Rippling - Financial Analyst
  'site:ats.rippling.com "Financial Analyst" "San Francisco" "hybrid"',
  'site:ats.rippling.com "Financial Analyst" "San Francisco" "remote"',
  'site:ats.rippling.com "Financial Analyst" "United States" "remote"',

  // Rippling - Senior Financial Analyst
  'site:ats.rippling.com "Senior Financial Analyst" "San Francisco" "hybrid"',
  'site:ats.rippling.com "Senior Financial Analyst" "San Francisco" "remote"',
  'site:ats.rippling.com "Senior Financial Analyst" "United States" "remote"',

  // Rippling - Finance Manager
  'site:ats.rippling.com "Finance Manager" "San Francisco" "hybrid"',
  'site:ats.rippling.com "Finance Manager" "San Francisco" "remote"',
  'site:ats.rippling.com "Finance Manager" "United States" "remote"',

  // Rippling - FP&A
  'site:ats.rippling.com "FP&A" "San Francisco" "hybrid"',
  'site:ats.rippling.com "FP&A" "San Francisco" "remote"',
  'site:ats.rippling.com "FP&A" "United States" "remote"',

  // Rippling - Financial Planning & Analysis
  'site:ats.rippling.com "Financial Planning & Analysis" "San Francisco" "hybrid"',
  'site:ats.rippling.com "Financial Planning & Analysis" "San Francisco" "remote"',
  'site:ats.rippling.com "Financial Planning & Analysis" "United States" "remote"',
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
