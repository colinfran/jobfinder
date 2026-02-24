import {
  DEFAULT_TOPIC,
  SEARCH_QUERIES,
  SEARCH_QUERIES_BY_TOPIC,
  TOPIC_BY_QUERY,
  TOPICS,
} from "@/lib/config/search-queries"

describe("lib/config/search-queries", () => {
  it("defines expected topics and default", () => {
    expect(TOPICS).toEqual(["software", "finance"])
    expect(DEFAULT_TOPIC).toBe("software")
  })

  it("flattens topic queries into SEARCH_QUERIES", () => {
    const expectedLength =
      SEARCH_QUERIES_BY_TOPIC.software.length + SEARCH_QUERIES_BY_TOPIC.finance.length

    expect(SEARCH_QUERIES).toHaveLength(expectedLength)
  })

  it("maps each query to its topic", () => {
    for (const [topic, queries] of Object.entries(SEARCH_QUERIES_BY_TOPIC)) {
      for (const query of queries) {
        expect(TOPIC_BY_QUERY[query]).toBe(topic)
      }
    }
  })
})
