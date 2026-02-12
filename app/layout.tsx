import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { FC } from "react"
import { ThemeProvider } from "@/providers/theme-provider"
import Header from "@/components/header/header"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Job Scraper",
  description:
    "Automated job scraper that finds and tracks job postings from Greenhouse, Lever, and Ashby.",
}

export const viewport = {
  themeColor: "#0a0a0a",
}

type RootLayoutProps = {
  children: React.ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <link href="/android-icon-192x192.png" rel="icon" sizes="192x192" type="image/png" />
        <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
        <link href="/favicon-96x96.png" rel="icon" sizes="96x96" type="image/png" />
        <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />

        <title>Job Scraper | AI Powered Job Search Aggregator</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Job Scraper" />
        <meta name="author" content="Job Scraper" />

        {/* SEO Meta Tags */}
        <meta
          name="description"
          content="Job Scraper is an AI powered job search aggregator that automatically discovers and extracts job listings from multiple platforms using Google Search and intelligent parsing. Track applications, manage deadlines, and never miss an opportunity."
        />
        <meta
          name="keywords"
          content="job scraper, job search aggregator, AI job search, job listing scraper, application tracker, job board aggregator, tech jobs, remote jobs, Google job search automation"
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Job Scraper | AI Powered Job Search Aggregator"
        />
        <meta
          property="og:description"
          content="Automatically scrape and aggregate job listings from multiple platforms using AI. Manage applications, track deadlines, and centralize your job search in one dashboard."
        />
        <meta property="og:url" content="https://jobfinder.dev" />
        <meta property="og:image" content="https://jobfinder.dev/og-image.jpg" />
        <meta
          property="og:image:alt"
          content="Dashboard view of Job Scraper aggregating job listings"
        />
        <meta property="og:site_name" content="Job Scraper" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Job Scraper | AI Powered Job Search Aggregator"
        />
        <meta
          name="twitter:description"
          content="AI powered job search aggregator that scrapes listings, extracts details, and helps you track applications and deadlines in one place."
        />
        <meta
          name="twitter:image"
          content="https://jobfinder.dev/og-image.jpg"
        />
        <meta
          name="twitter:image:alt"
          content="Job Scraper dashboard showing aggregated job listings"
        />

        <link rel="canonical" href="https://jobfinder.dev" />
        <link href="/manifest.json" rel="manifest" />
      </head>

      <body className="flex min-h-screen w-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
            <div className="flex flex-col sm:gap-4 sm:px-7 sm:py-4">
              <Header />
              <main className="flex-1 items-start gap-2 md:gap-4">{children}</main>
            </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

export default RootLayout;

