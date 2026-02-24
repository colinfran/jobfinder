import { extractCompany } from "@/app/api/cron/search-jobs/extract-company"
import { extractSource } from "@/app/api/cron/search-jobs/extract-source"
import { isValidJobLink } from "@/app/api/cron/search-jobs/is-valid-job-link"
import { normalizeJobUrl } from "@/app/api/cron/search-jobs/normalize-url"

describe("search-jobs helpers", () => {
  describe("isValidJobLink", () => {
    it("accepts supported job board URLs", () => {
      expect(isValidJobLink("https://boards.greenhouse.io/company/jobs/12345")).toBe(true)
      expect(
        isValidJobLink("https://jobs.lever.co/company/123e4567-e89b-12d3-a456-426614174000/apply"),
      ).toBe(true)
      expect(
        isValidJobLink(
          "https://jobs.ashbyhq.com/Acme/123e4567-e89b-12d3-a456-426614174000/application",
        ),
      ).toBe(true)
      expect(
        isValidJobLink("https://shipt.wd1.myworkdayjobs.com/en-US/recruiting/company/job/12345"),
      ).toBe(true)
    })

    it("rejects malformed or unsupported links", () => {
      expect(isValidJobLink("not-a-url")).toBe(false)
      expect(isValidJobLink("https://example.com/jobs/12345")).toBe(false)
      expect(isValidJobLink("https://jobs.lever.co/company/not-a-uuid")).toBe(false)
    })
  })

  describe("normalizeJobUrl", () => {
    it("strips trailing slash and board-specific suffixes", () => {
      expect(normalizeJobUrl("https://jobs.ashbyhq.com/Acme/uuid/application/")).toBe(
        "https://jobs.ashbyhq.com/Acme/uuid",
      )
      expect(normalizeJobUrl("https://jobs.lever.co/company/uuid/apply")).toBe(
        "https://jobs.lever.co/company/uuid",
      )
    })

    it("returns original input for invalid URL", () => {
      expect(normalizeJobUrl("bad-link")).toBe("bad-link")
    })
  })

  describe("extractCompany", () => {
    it("extracts company from URL path", () => {
      expect(extractCompany("irrelevant", "https://boards.greenhouse.io/acme-inc/jobs/123")).toBe(
        "Acme Inc",
      )
      expect(extractCompany("irrelevant", "https://jobs.lever.co/acme-inc/123")).toBe("Acme Inc")
      expect(extractCompany("irrelevant", "https://jobs.ashbyhq.com/acme-inc/123")).toBe("Acme Inc")
    })

    it("extracts workday company from subdomain", () => {
      expect(
        extractCompany(
          "irrelevant",
          "https://acme-corp.wd1.myworkdayjobs.com/en-US/recruiting/job/1",
        ),
      ).toBe("Acme Corp")
    })

    it("falls back to title parsing", () => {
      expect(extractCompany("Senior Engineer at ACME Corp - Full Time", "invalid-url")).toBe(
        "ACME Corp",
      )
    })
  })

  describe("extractSource", () => {
    it("maps known hosts", () => {
      expect(extractSource("https://boards.greenhouse.io/acme/jobs/1")).toBe("greenhouse.io")
      expect(extractSource("https://jobs.lever.co/acme/1")).toBe("lever.co")
      expect(extractSource("https://jobs.ashbyhq.com/acme/1")).toBe("ashbyhq.com")
      expect(extractSource("https://acme.wd1.myworkdayjobs.com/job/1")).toBe("myworkdayjobs.com")
    })

    it("falls back to normalized hostname or unknown", () => {
      expect(extractSource("https://www.example.com/jobs/1")).toBe("example.com")
      expect(extractSource("bad-url")).toBe("unknown")
    })
  })
})
