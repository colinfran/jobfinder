import path from "node:path"
import { fileURLToPath } from "node:url"
import nextJest from "next/jest.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, "..")

const createJestConfig = nextJest({ dir: projectRoot })

const customJestConfig = {
  rootDir: projectRoot,
  setupFilesAfterEnv: ["<rootDir>/_tests_/setup.ts"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/_tests_/unit/**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/.next/", "<rootDir>/tools/"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  coverageDirectory: "<rootDir>/_tests_/coverage",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["/node_modules/(?!(jose)/)"],
  clearMocks: true,
}

export default createJestConfig(customJestConfig)
