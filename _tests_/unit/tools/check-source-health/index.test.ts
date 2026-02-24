/** @jest-environment node */
import {
  checkAllSources,
  checkSourceHealth,
  type JobSource,
} from "../../../../tools/check-source-health/index"

describe("tools/check-source-health", () => {
  it("returns healthy result when fetch succeeds", async () => {
    const source: JobSource = {
      name: "Test Source",
      domain: "example.com",
      testUrl: "https://example.com",
    }

    const result = await checkSourceHealth(source, {
      fetchFn: jest.fn().mockResolvedValue({ ok: true, status: 200 } as Response),
      now: jest.fn().mockReturnValueOnce(100).mockReturnValueOnce(240),
    })

    expect(result).toEqual({
      source: "Test Source",
      healthy: true,
      status: 200,
      responseTime: 140,
    })
  })

  it("returns unhealthy result when fetch throws", async () => {
    const source: JobSource = {
      name: "Test Source",
      domain: "example.com",
      testUrl: "https://example.com",
    }

    const result = await checkSourceHealth(source, {
      fetchFn: jest.fn().mockRejectedValue(new Error("network down")),
      now: jest.fn().mockReturnValueOnce(1_000).mockReturnValueOnce(1_120),
    })

    expect(result).toEqual({
      source: "Test Source",
      healthy: false,
      responseTime: 120,
      error: "network down",
    })
  })

  it("returns false when any source is unhealthy", async () => {
    const sources: JobSource[] = [
      { name: "A", domain: "a.com", testUrl: "https://a.com" },
      { name: "B", domain: "b.com", testUrl: "https://b.com" },
    ]
    const log = jest.fn()
    const check = jest
      .fn()
      .mockResolvedValueOnce({ source: "A", healthy: true, status: 200, responseTime: 10 })
      .mockResolvedValueOnce({
        source: "B",
        healthy: false,
        status: 503,
        responseTime: 20,
        error: "service unavailable",
      })

    const allHealthy = await checkAllSources(sources, { log, check })

    expect(allHealthy).toBe(false)
    expect(check).toHaveBeenCalledTimes(2)
    expect(log).toHaveBeenCalledWith(expect.stringContaining("Some sources are down"))
  })
})
