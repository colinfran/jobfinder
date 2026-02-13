import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, Globe } from "lucide-react"
import Link from "next/link"
import { FC } from "react"

const Page: FC = async () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-balance">JobFinder</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            An automated job search aggregator that collects listings from multiple platforms using Google Search. Never miss an opportunity again. Track and manage all your applications in one place.
          </p>
        </div>

        {/* Why I Built It */}
        <div className="mb-12 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Why This Exists</h3>
            <p className="text-muted-foreground leading-relaxed">
              Job hunting is repetitive and time-consuming. The same roles appear across different
              platforms, and staying on top of new listings requires constant manual searching.
              JobFinder automates this process, surfaces relevant opportunities faster, and
              centralizes everything in one dashboard.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">How It Works</h3>
            <p className="text-muted-foreground leading-relaxed">
              JobFinder uses Google Search and the Serper API to discover job postings across the web. Structured job details such as title, company, location, and application links are programmatically extracted and stored in PostgreSQL. Everything is presented in a centralized dashboard for easy tracking.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Application Management</h3>
            <p className="text-muted-foreground leading-relaxed">
              Once listings are collected, you can track application status, organize roles by
              priority, and set reminders for deadlines. The goal is simple: never miss a strong
              opportunity and avoid wasting time on manual browsing.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <p className="text-muted-foreground leading-relaxed">
            Next.js, React, Vercel, PostgreSQL, Drizzle ORM, Tailwind CSS, shadcn/ui, and the Serper API for job discovery.
          </p>
        </div>

        {/* Built By */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Built by Colin Franceschini</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              href="https://github.com/colinfran"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Badge>
                <Github className="h-4 w-4" />
                GitHub
              </Badge>
            </Link>
            <Link
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              href="https://www.linkedin.com/in/colinfranceschini/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Badge>
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Badge>
            </Link>
            <Link
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              href="https://x.com/colinfran"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Badge>
                <svg
                  className="h-[10px]! w-[10px]! transition-all"
                  stroke="currentColor"
                  strokeWidth=".25px"
                  viewBox="0 0 24 24"
                  width="6px"
                >
                  <path
                    d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z"
                    fill="currentColor"
                  />
                </svg>
                x.com
              </Badge>
            </Link>
            <Link
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              href="https://colinfran.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Badge>
                <Globe className="h-4 w-4" />
                Website
              </Badge>
            </Link>
          </div>
        </div>

        {/* Project Status */}
        <div className="mb-6">
          <p className="text-muted-foreground leading-relaxed">
            JobFinder is actively evolving as I refine my job search workflow. While others are
            welcome to use it, it is primarily a personal tool designed around my own application
            strategy and filtering preferences.
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-sm text-muted-foreground italic">
          JobFinder aggregates publicly available listings. Always verify job details directly with
          the employer before applying.
        </p>

        {/* Legal Links */}
        <div className="mt-8 pt-6 border-t border-border flex gap-4 text-sm text-muted-foreground">
          <Link className="hover:text-foreground transition-colors" href="/terms">
            Terms of Service
          </Link>
          <span>·</span>
          <Link className="hover:text-foreground transition-colors" href="/privacy">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Page
