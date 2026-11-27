import { z } from "zod"
import { StructuredTool } from "@langchain/core/tools"
import * as cheerio from "cheerio"
import { validatePublicHttpUrl, fetchWithTimeout, readTextWithLimit } from "./url-safety"

export interface ScrapedJob {
  title: string
  company: string
  location: string
  url: string
  salary?: string
  tags: string[]
  source: string
  publishedAt?: string
  summary: string
  matchScore?: number
  matchedKeywords?: string[]
}

const STOP_WORDS = new Set([
  "with", "from", "that", "this", "have", "will", "your", "their", "about",
  "work", "team", "experience", "years", "using", "built", "build", "strong",
  "skills", "role", "position", "company", "looking", "developer", "engineer",
  "software", "senior", "junior", "remote", "full", "time", "part", "and",
  "the", "for", "are", "you", "our", "all", "can", "into", "over", "more",
])

function extractKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w))
  return Array.from(new Set(tokens))
}

function scoreJobAgainstResume(job: ScrapedJob, resumeText: string, queryText: string): ScrapedJob {
  const resumeKeywords = extractKeywords(resumeText)
  const queryKeywords = extractKeywords(queryText)
  const hay = `${job.title} ${job.company} ${job.tags.join(" ")} ${job.summary}`.toLowerCase()

  const matched = new Set<string>()
  let points = 0

  for (const kw of resumeKeywords) {
    if (hay.includes(kw)) {
      matched.add(kw)
      points += job.title.toLowerCase().includes(kw) ? 4 : 2
    }
  }

  for (const kw of queryKeywords) {
    if (hay.includes(kw)) {
      matched.add(kw)
      points += job.title.toLowerCase().includes(kw) ? 5 : 2
    }
  }

  const denominator = Math.max(12, Math.min(30, resumeKeywords.length * 1.4 + queryKeywords.length * 2))
  const matchScore = Math.min(99, Math.max(15, Math.round((points / denominator) * 100)))

  return {
    ...job,
    matchScore,
    matchedKeywords: Array.from(matched).slice(0, 8),
  }
}

function stripHtml(raw: string): string {
  if (!raw) return ""
  const $ = cheerio.load(raw)
  return $.text().replace(/\s+/g, " ").trim()
}

async function fetchRemoteOkJobs(query: string): Promise<ScrapedJob[]> {
  try {
    const res = await fetchWithTimeout("https://remoteok.com/api", {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return []
    const data = (await res.json()) as any[]
    const qTerms = extractKeywords(query)

    return data
      .filter((item) => item && item.position && item.company)
      .filter((item) => {
        if (!qTerms.length) return true
        const hay = `${item.position} ${item.company} ${(item.tags || []).join(" ")}`.toLowerCase()
        return qTerms.some((t) => hay.includes(t))
      })
      .slice(0, 12)
      .map((item) => ({
        title: String(item.position),
        company: String(item.company),
        location: String(item.location || "Remote"),
        url: String(item.apply_url || item.url || ""),
        salary:
          item.salary_min || item.salary_max
            ? `$${item.salary_min || "?"} - $${item.salary_max || "?"}`
            : undefined,
        tags: Array.isArray(item.tags) ? item.tags.slice(0, 6).map(String) : [],
        source: "RemoteOK",
        publishedAt: item.date ? String(item.date) : undefined,
        summary: stripHtml(String(item.description || "")).slice(0, 420),
      }))
  } catch {
    return []
  }
}

async function fetchRemotiveJobs(query: string): Promise<ScrapedJob[]> {
  try {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=12`
    const res = await fetchWithTimeout(url, {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { jobs?: any[] }
    return (json.jobs || []).slice(0, 12).map((item) => ({
      title: String(item.title || ""),
      company: String(item.company_name || ""),
      location: String(item.candidate_required_location || "Remote"),
      url: String(item.url || ""),
      salary: item.salary ? String(item.salary) : undefined,
      tags: Array.isArray(item.tags) ? item.tags.slice(0, 6).map(String) : [],
      source: "Remotive",
      publishedAt: item.publication_date ? String(item.publication_date) : undefined,
      summary: stripHtml(String(item.description || "")).slice(0, 420),
    }))
  } catch {
    return []
  }
}

async function fetchArbeitnowJobs(query: string): Promise<ScrapedJob[]> {
  try {
    const res = await fetchWithTimeout("https://www.arbeitnow.com/api/job-board-api", {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { data?: any[] }
    const qTerms = extractKeywords(query)

    return (json.data || [])
      .filter((item) => {
        if (!qTerms.length) return true
        const hay = `${item.title || ""} ${item.company_name || ""} ${(item.tags || []).join(" ")}`.toLowerCase()
        return qTerms.some((t) => hay.includes(t))
      })
      .slice(0, 10)
      .map((item) => ({
        title: String(item.title || ""),
        company: String(item.company_name || ""),
        location: item.remote ? "Remote" : String(item.location || "Hybrid/Onsite"),
        url: String(item.url || ""),
        tags: Array.isArray(item.tags) ? item.tags.slice(0, 6).map(String) : [],
        source: "Arbeitnow",
        summary: stripHtml(String(item.description || "")).slice(0, 420),
      }))
  } catch {
    return []
  }
}

async function fetchCustomBoardJobs(boardUrl: string): Promise<ScrapedJob[]> {
  const parsed = validatePublicHttpUrl(boardUrl)

  // Greenhouse public board shortcut
  if (parsed.hostname.includes("greenhouse.io")) {
    const slug = parsed.pathname.split("/").filter(Boolean)[0]
    if (slug) {
      const ghRes = await fetchWithTimeout(
        `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`
      )
      if (ghRes.ok) {
        const ghJson = (await ghRes.json()) as { jobs?: any[] }
        return (ghJson.jobs || []).slice(0, 15).map((j) => ({
          title: String(j.title || ""),
          company: slug,
          location: String(j.location?.name || "Unknown"),
          url: String(j.absolute_url || boardUrl),
          tags: [],
          source: "Greenhouse",
          publishedAt: j.updated_at ? String(j.updated_at) : undefined,
          summary: stripHtml(String(j.content || "")).slice(0, 420),
        }))
      }
    }
  }

  // Lever public board shortcut
  if (parsed.hostname.includes("lever.co")) {
    const slug = parsed.pathname.split("/").filter(Boolean)[0]
    if (slug) {
      const lvRes = await fetchWithTimeout(
        `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`
      )
      if (lvRes.ok) {
        const postings = (await lvRes.json()) as any[]
        return postings.slice(0, 15).map((j) => ({
          title: String(j.text || ""),
          company: slug,
          location: String(j.categories?.location || "Unknown"),
          url: String(j.hostedUrl || boardUrl),
          tags: [j.categories?.team, j.categories?.commitment].filter(Boolean).map(String),
          source: "Lever",
          summary: String(j.descriptionPlain || "").slice(0, 420),
        }))
      }
    }
  }

  // Generic HTML careers page extraction
  const res = await fetchWithTimeout(parsed.toString())
  if (!res.ok) {
    throw new Error(`Failed to scrape careers page (${res.status})`)
  }
  const html = await readTextWithLimit(res)
  const $ = cheerio.load(html)
  $("script, style, nav, footer").remove()

  const jobs: ScrapedJob[] = []
  const seen = new Set<string>()
  const hostCompany = parsed.hostname.replace(/^www\./, "").split(".")[0]

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || ""
    const text = $(el).text().replace(/\s+/g, " ").trim()
    if (!text || text.length < 6 || text.length > 110) return
    const looksLikeJob =
      /engineer|developer|designer|manager|analyst|architect|scientist|lead|intern|product|devops|full.?stack|frontend|backend|ai|ml/i.test(
        text
      ) || /job|career|position|opening|role|apply/i.test(href)

    if (!looksLikeJob) return
    let absUrl = href
    try {
      absUrl = new URL(href, parsed.toString()).toString()
    } catch {
      return
    }
    if (seen.has(absUrl)) return
    seen.add(absUrl)

    jobs.push({
      title: text,
      company: hostCompany,
      location: "See posting",
      url: absUrl,
      tags: [],
      source: parsed.hostname,
      summary: text,
    })
  })

  return jobs.slice(0, 15)
}

export class JobScraperTool extends StructuredTool {
  name = "scrape_jobs"
  description =
    "Scrape live job openings from RemoteOK, Remotive, Arbeitnow, or a custom Greenhouse/Lever/careers URL and rank the best matches against the user's resume."
  schema = z.object({
    query: z
      .string()
      .describe("Role, stack, or keywords to search for (e.g. 'Next.js TypeScript AI engineer')"),
    customBoardUrl: z
      .string()
      .optional()
      .describe("Optional specific Greenhouse, Lever, or company careers page URL to scrape"),
    limit: z
      .number()
      .optional()
      .default(8)
      .describe("Maximum ranked jobs to return (default 8)"),
  })

  private resumeText: string

  constructor(resumeText = "") {
    super()
    this.resumeText = resumeText
  }

  async _call({ query, customBoardUrl, limit }: z.infer<typeof this.schema>): Promise<string> {
    let rawJobs: ScrapedJob[] = []

    if (customBoardUrl?.trim()) {
      rawJobs = await fetchCustomBoardJobs(customBoardUrl.trim())
    } else {
      const [remoteOk, remotive, arbeitnow] = await Promise.all([
        fetchRemoteOkJobs(query),
        fetchRemotiveJobs(query),
        fetchArbeitnowJobs(query),
      ])
      rawJobs = [...remoteOk, ...remotive, ...arbeitnow]
    }

    const dedupedMap = new Map<string, ScrapedJob>()
    for (const job of rawJobs) {
      const key = `${job.title.toLowerCase()}::${job.company.toLowerCase()}`
      if (!dedupedMap.has(key) && job.title) {
        dedupedMap.set(key, job)
      }
    }

    const ranked = Array.from(dedupedMap.values())
      .map((job) => scoreJobAgainstResume(job, this.resumeText, query))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, Math.min(Math.max(limit || 8, 1), 15))

    return JSON.stringify({
      query,
      resumeProvided: Boolean(this.resumeText.trim()),
      totalScraped: dedupedMap.size,
      topMatches: ranked,
    })
  }
}
