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
   git clone <repository>
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
   BETTER_AUTH_SECRET=your_betterauth_secret
   BETTER_AUTH_URL=http://localhost:3000 // or production url
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000 // or production url
   ```

4. Set up the database:

   ```bash
   npm run db:setup
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

