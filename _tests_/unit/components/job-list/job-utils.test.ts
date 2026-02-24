import { sourceColor, timeAgo } from "@/components/job-list/job-utils"

describe("components/job-list/job-utils", () => {
  describe("timeAgo", () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date("2026-02-24T12:00:00.000Z"))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("returns 'just now' for sub-minute differences", () => {
      expect(timeAgo(new Date("2026-02-24T11:59:45.000Z"))).toBe("just now")
    })

    it("returns minute granularity", () => {
      expect(timeAgo(new Date("2026-02-24T11:29:00.000Z"))).toBe("31m ago")
    })

    it("returns hour granularity", () => {
      expect(timeAgo(new Date("2026-02-24T09:00:00.000Z"))).toBe("3h ago")
    })

    it("returns day granularity", () => {
      expect(timeAgo(new Date("2026-02-22T12:00:00.000Z"))).toBe("2d ago")
    })

    it("returns short date after seven days", () => {
      expect(timeAgo(new Date("2026-02-10T12:00:00.000Z"))).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/)
    })
  })

  describe("sourceColor", () => {
    it("returns greenhouse styles", () => {
      expect(sourceColor("greenhouse.io")).toBe("bg-teal-500/15 text-teal-600")
    })

    it("returns fallback styles for unknown source", () => {
      expect(sourceColor("example.com")).toBe("bg-muted text-muted-foreground")
    })
  })
})
