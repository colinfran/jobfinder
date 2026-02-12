import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"

config({ path: ".env" })

const sql = neon(process.env.DATABASE_URL)

const createJobsTable = `
  CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    link TEXT NOT NULL UNIQUE,
    snippet TEXT,
    source TEXT,
    search_query TEXT,
    applied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`

async function setupDb() {
  try {
    await sql.query(createJobsTable)
    console.log("✅ Database setup complete")
  } catch (err) {
    console.error("❌ Failed to setup database:", err)
    process.exit(1)
  }
}

setupDb()
