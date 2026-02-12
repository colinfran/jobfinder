import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TooltipProvider } from "@/components/ui/tooltip"

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

        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="yes" name="mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content="Job Scraper" name="apple-mobile-web-app-title" />
        <meta content="Job Scraper" name="author" />

        {/* SEO Meta Tags */}
        <meta
          content="Job Scraper is an AI powered job search aggregator that automatically discovers and extracts job listings from multiple platforms using Google Search and intelligent parsing. Track applications, manage deadlines, and never miss an opportunity."
          name="description"
        />
        <meta
          content="job scraper, job search aggregator, AI job search, job listing scraper, application tracker, job board aggregator, tech jobs, remote jobs, Google job search automation"
          name="keywords"
        />
        <meta content="index, follow" name="robots" />

        {/* Open Graph Meta Tags */}
        <meta content="website" property="og:type" />
        <meta content="Job Scraper | AI Powered Job Search Aggregator" property="og:title" />
        <meta
          content="Automatically scrape and aggregate job listings from multiple platforms using AI. Manage applications, track deadlines, and centralize your job search in one dashboard."
          property="og:description"
        />
        <meta content="https://jobfinder.dev" property="og:url" />
        <meta content="https://jobfinder.dev/og-image.jpg" property="og:image" />
        <meta
          content="Dashboard view of Job Scraper aggregating job listings"
          property="og:image:alt"
        />
        <meta content="Job Scraper" property="og:site_name" />

        {/* Twitter Card Meta Tags */}
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="Job Scraper | AI Powered Job Search Aggregator" name="twitter:title" />
        <meta
          content="AI powered job search aggregator that scrapes listings, extracts details, and helps you track applications and deadlines in one place."
          name="twitter:description"
        />
        <meta content="https://jobfinder.dev/og-image.jpg" name="twitter:image" />
        <meta
          content="Job Scraper dashboard showing aggregated job listings"
          name="twitter:image:alt"
        />

        <link href="https://jobfinder.dev" rel="canonical" />
        <link href="/manifest.json" rel="manifest" />
      </head>

      <body className="flex min-h-screen w-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <TooltipProvider>
            <div className="flex flex-col sm:gap-4 sm:px-7 sm:py-4">
              <Header />
              <main className="flex-1 items-start gap-2 md:gap-4">{children}</main>
            </div>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

export default RootLayout
