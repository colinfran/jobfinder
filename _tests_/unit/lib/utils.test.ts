import { formatTimeRemaining, getNextCronRun } from "@/lib/utils"

describe("lib/utils", () => {
  describe("getNextCronRun", () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("returns 12:00 UTC same day when current time is before noon UTC", () => {
      jest.setSystemTime(new Date("2026-02-24T10:30:00.000Z"))

      expect(getNextCronRun().toISOString()).toBe("2026-02-24T12:00:00.000Z")
    })

    it("returns 00:00 UTC next day when current time is noon or later UTC", () => {
      jest.setSystemTime(new Date("2026-02-24T18:30:00.000Z"))

      expect(getNextCronRun().toISOString()).toBe("2026-02-25T00:00:00.000Z")
    })
  })

  describe("formatTimeRemaining", () => {
    it("formats seconds", () => {
      expect(formatTimeRemaining(9_000)).toBe("09s")
    })

    it("formats minutes and seconds", () => {
      expect(formatTimeRemaining(61_000)).toBe("01m 01s")
    })

    it("formats hours with padded minutes/seconds", () => {
      expect(formatTimeRemaining(3_726_000)).toBe("1h 02m 06s")
    })
  })
})
