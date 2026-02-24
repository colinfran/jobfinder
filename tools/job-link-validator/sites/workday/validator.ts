import {
  deleteInvalidWorkdayJobs,
  fetchBoardPostings,
  fetchDetailPosting,
  fetchWorkdayJobs,
} from "./api"
import {
  extractLocationInfoFromDetail,
  extractLocationInfoFromPosting,
  isValidWorkdayLocation,
} from "./location"
import { buildPostingIndex, extractBoardAndPaths, extractReqId } from "./parsing"
import type { Job } from "./types"

export async function validateWorkdayJobs(appUrl: string, cronSecret: string): Promise<void> {
  console.log("\n🔶 Starting Workday job validation")

  const jobs = await fetchWorkdayJobs(appUrl, cronSecret)
  console.log(`📋 Found ${jobs.length} Workday jobs to validate`)

  const invalidJobIds: string[] = []
  const jobsByBoard = new Map<string, Job[]>()

  for (const job of jobs) {
    const parsed = extractBoardAndPaths(job.link)
    if (!parsed) {
      console.log(`⚠️ Unsupported Workday URL, skipping removal: ${job.title}`)
      continue
    }

    const boardKey = `${parsed.origin}|${parsed.tenant}|${parsed.site}`
    const boardJobs = jobsByBoard.get(boardKey)
    if (boardJobs) {
      boardJobs.push(job)
    } else {
      jobsByBoard.set(boardKey, [job])
    }
  }

  for (const [boardKey, boardJobs] of jobsByBoard.entries()) {
    const [origin, tenant, site] = boardKey.split("|")
    if (!origin || !tenant || !site) continue

    console.log(`🌐 Fetching Workday board index: ${tenant}/${site} (${boardJobs.length} jobs)`)
    const postings = await fetchBoardPostings({ origin, tenant, site })
    if (!postings) {
      console.log(`⚠️ Could not fetch board index, skipping removal: ${tenant}/${site}`)
      continue
    }

    const postingIndex = buildPostingIndex(postings)

    for (const job of boardJobs) {
      try {
        console.log(`🔍 Validating: ${job.title}`)
        const parsed = extractBoardAndPaths(job.link)
        if (!parsed) {
          console.log(`⚠️ Unsupported Workday URL, skipping removal: ${job.title}`)
          continue
        }

        const reqId = extractReqId(parsed.fullPath)
        const fullPathMatch = postingIndex.byFullPathToPosting.get(parsed.fullPath) ?? null
        const jobPathMatch = parsed.jobPath
          ? (postingIndex.byJobPathToPosting.get(parsed.jobPath) ?? null)
          : null
        const reqIdMatch = reqId ? (postingIndex.byToken.get(reqId) ?? null) : null
        const matchedPosting = fullPathMatch ?? jobPathMatch ?? reqIdMatch

        if (!matchedPosting) {
          const detailResponse = await fetchDetailPosting(parsed)
          if (detailResponse?.jobPostingInfo) {
            if (detailResponse.jobPostingInfo.posted === false) {
              console.log(`❌ Invalid (detail says unposted): ${job.title}`)
              console.log(`   ↳ link=${job.link}`)
              invalidJobIds.push(job.id)
              continue
            }

            const detailLocationInfo = extractLocationInfoFromDetail(detailResponse)
            if (!detailLocationInfo) {
              console.log(`✅ Valid (detail match, no location data): ${job.title}`)
              continue
            }

            if (!isValidWorkdayLocation(detailLocationInfo)) {
              console.log(`❌ Invalid (detail location): ${job.title}`)
              console.log(`   ↳ link=${job.link}`)
              invalidJobIds.push(job.id)
            } else {
              console.log(`✅ Valid (detail match): ${job.title}`)
            }
            continue
          }

          const boardIndexSize = postingIndex.byFullPathToPosting.size
          console.log(`❌ Invalid (not in board index): ${job.title}`)
          console.log(
            `   ↳ board=${tenant}/${site} entries=${boardIndexSize} jobPath=${parsed.jobPath ?? "n/a"} req=${reqId ?? "n/a"}`,
          )
          console.log(`   ↳ link=${job.link}`)
          invalidJobIds.push(job.id)
          continue
        }

        if (!fullPathMatch && !jobPathMatch && reqIdMatch) {
          console.log(`✅ Valid (req-id match): ${job.title}`)
        } else if (!fullPathMatch && jobPathMatch) {
          console.log(`✅ Valid (job-path match): ${job.title}`)
        } else if (fullPathMatch) {
          console.log(`✅ Valid (full-path match): ${job.title}`)
        } else {
          console.log(`✅ Valid: ${job.title}`)
        }

        const locationInfo = extractLocationInfoFromPosting(matchedPosting)
        if (!locationInfo) {
          console.log(`⚠️ Unknown location, skipping removal: ${job.title}`)
          continue
        }

        if (!isValidWorkdayLocation(locationInfo)) {
          console.log(`❌ Invalid: ${job.title}`)
          console.log(`   ↳ link=${job.link}`)
          invalidJobIds.push(job.id)
          continue
        }

        console.log(`✅ Valid: ${job.title}`)
      } catch (err) {
        console.error(`Error validating job ${job.id}:`, err)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  if (invalidJobIds.length > 0) {
    console.log(`\n🗑️ Removing ${invalidJobIds.length} invalid Workday jobs`)
    const jobsRemoved = await deleteInvalidWorkdayJobs(appUrl, cronSecret, invalidJobIds)
    console.log(`✨ ${jobsRemoved} Workday jobs removed`)
  } else {
    console.log("✨ All Workday jobs are valid!")
  }
}
