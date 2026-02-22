# JobFinder

JobFinder is an automated job search aggregator that collects listings from multiple platforms using Google Search. Never miss an opportunity again. Track and manage all your applications in one place.

## Technologies Used

[![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Next JS](https://img.shields.io/badge/Next-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-000000?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-000000?style=for-the-badge&logo=drizzle&logoColor=white)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-000000?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Serper API](https://img.shields.io/badge/Serper%20API-000000?style=for-the-badge&logo=google&logoColor=white)](https://serper.dev/)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon Serverless)
- Serper API key (for job searching)

### Installation

1. Clone and navigate to the project:

   ```bash
   git clone https://github.com/colinfran/jobfinder.git
   cd jobfinder
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env.local` file with:

   ```env
   DATABASE_URL=postgresql://your_database_url
   SERPER_API_KEY=your_serper_api_key
   CRON_SECRET=your_cron_secret
   GITHUB_TOKEN=your_github_pat_token
   BETTER_AUTH_SECRET=your_betterauth_secret
   BETTER_AUTH_URL=http://localhost:3000 // or production url
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000 // or production url
   ```

   **Note on GITHUB_TOKEN:** Create a Personal Access Token (classic) at https://github.com/settings/tokens with `workflow` and `repo` scopes. This is used to trigger the validation workflow via API.

4. Set up the database:

   ```bash
   npm run db:setup
   ```

5. Install dependencies for the validation tool:

   ```bash
   cd tools/job-link-validator
   npm install
   cd ../..
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.


## Three Core Processes

### 1. Search (Vercel Cron)
Runs on schedule: `0 0,12 * * *` (daily at 12:00am and 12:00pm UTC)
- Calls Serper API with predefined job search queries
- Validates links are live for Lever.co and Greenhouse (server-side rendered sites) using fetch + HTML parsing
- Skips initial validation for Ashby and Workday (client-side rendered; validated later by GitHub Actions)
- Deduplicates job postings
- Inserts valid jobs into the database

### 2. Validation (Vercel Cron)
Runs on schedule: `20 0,12 * * *` (daily at 12:20am and 12:20pm UTC)
- Removes duplicates from all job sources (Greenhouse, Lever.co, Ashby, Workday)
- Validates dead links and location for Greenhouse and Lever.co (server-side rendered) using fetch + HTML parsing:
  - **Greenhouse**: Parses canonical URL meta tag to detect removed jobs, extracts location from og:description, validates SF Bay Area presence
  - **Lever.co**: Extracts location from twitter meta tags, validates workplace type, validates SF Bay Area presence
- Triggers GitHub Actions workflow for Ashby and Workday validation

### 3. Ashby + Workday Validation (GitHub Actions)
Triggered by:
- API trigger: Via `repository_dispatch` event (called from Vercel validation cron at 12:20am and 12:20pm UTC)
- Manual trigger: Via GitHub Actions `workflow_dispatch` button

Validation strategy:
- **Ashby**: Uses Puppeteer to load the posting page, extracts location + location type, validates SF Bay Area presence
- **Workday**: Calls Workday's CXS JSON endpoint (`/wday/cxs/...`) and validates from API fields (`location`, `additionalLocations`, `remoteType`)

Workday safety behavior:
- If Workday CXS responds with errors (for example 403) or location data is missing, the job is skipped (not auto-removed)
- Jobs are removed only when Workday data is successfully fetched and fails location validation

**Location Validation Rules (Applied to All Job Boards):**
- Accepts: San Francisco, SF Bay Area, Bay Area, Remote
- Rejects: Non-SF locations without explicit Remote designation
- Requires: On-site positions must be in SF; Hybrid/Remote must include SF or Remote option

