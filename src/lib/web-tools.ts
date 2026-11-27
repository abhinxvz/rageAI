import { z } from "zod"
import { StructuredTool } from "@langchain/core/tools"
import * as cheerio from "cheerio"
import { validatePublicHttpUrl, fetchWithTimeout } from "./url-safety"

function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }

  try {
    const url = new URL(trimmed)
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] || null
    }
    if (url.hostname.includes("youtube.com")) {
      const vParam = url.searchParams.get("v")
      if (vParam) return vParam
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
        return parts[1] || null
      }
    }
  } catch {
    return null
  }
  return null
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function formatSeconds(sec: number): string {
  const mins = Math.floor(sec / 60)
  const rem = Math.floor(sec % 60)
  return `${mins}:${rem.toString().padStart(2, "0")}`
}

export class WebPageReaderTool extends StructuredTool {
  name = "read_webpage"
  description =
    "Fetch and read the main text, title, description, and headings from any public webpage URL without requiring OAuth."
  schema = z.object({
    url: z.string().describe("Full https:// or http:// URL of the webpage to read"),
  })

  async _call({ url }: z.infer<typeof this.schema>): Promise<string> {
    const parsed = validatePublicHttpUrl(url)
    const response = await fetchWithTimeout(parsed.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch page (${response.status} ${response.statusText})`)
    }

    const contentType = response.headers.get("content-type") || ""
    const rawBody = await response.text()

    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      return JSON.stringify({
        url: parsed.toString(),
        contentType,
        content: rawBody.slice(0, 12000),
      })
    }

    const $ = cheerio.load(rawBody)
    $("script, style, noscript, svg, iframe, nav, footer, header").remove()

    const title = $("title").first().text().trim() || $("h1").first().text().trim()
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      ""
    const headings = $("h1, h2, h3")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 15)

    const mainText = ($("main").text() || $("article").text() || $("body").text())
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000)

    return JSON.stringify({
      url: parsed.toString(),
      title,
      description,
      headings,
      content: mainText,
    })
  }
}

export class YouTubeTranscriptTool extends StructuredTool {
  name = "youtube_transcript"
  description =
    "Extract metadata and timestamped transcript from a public YouTube video URL or video ID for summarization."
  schema = z.object({
    urlOrId: z.string().describe("YouTube video URL (youtube.com/watch?v=... or youtu.be/...) or 11-char video ID"),
  })

  async _call({ urlOrId }: z.infer<typeof this.schema>): Promise<string> {
    const videoId = extractYouTubeVideoId(urlOrId)
    if (!videoId) {
      throw new Error("Could not parse a valid YouTube video ID")
    }

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
    const response = await fetchWithTimeout(watchUrl, {
      headers: { "Accept-Language": "en-US,en;q=0.9" },
    })
    if (!response.ok) {
      throw new Error(`Failed to load YouTube page (${response.status})`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const title = $('meta[name="title"]').attr("content") || $("title").text().replace(" - YouTube", "").trim()
    const description = $('meta[name="description"]').attr("content") || ""

    const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/)
    let captionTracks: Array<{ baseUrl: string; languageCode: string }> = []
    if (playerMatch?.[1]) {
      try {
        const playerData = JSON.parse(playerMatch[1])
        captionTracks =
          playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
      } catch {
        captionTracks = []
      }
    }

    if (!captionTracks.length) {
      return JSON.stringify({
        videoId,
        url: watchUrl,
        title,
        description,
        transcriptAvailable: false,
        note: "No public captions found; returning video title and description metadata.",
      })
    }

    const preferredTrack =
      captionTracks.find((t) => t.languageCode?.startsWith("en")) || captionTracks[0]
    const transcriptRes = await fetchWithTimeout(preferredTrack.baseUrl)
    const transcriptXml = await transcriptRes.text()
    const xmlDoc = cheerio.load(transcriptXml, { xmlMode: true })

    const lines = xmlDoc("text")
      .map((_, el) => {
        const start = parseFloat(xmlDoc(el).attr("start") || "0")
        const text = decodeXmlEntities(xmlDoc(el).text())
        return text ? `[${formatSeconds(start)}] ${text}` : ""
      })
      .get()
      .filter(Boolean)

    return JSON.stringify({
      videoId,
      url: watchUrl,
      title,
      language: preferredTrack.languageCode,
      transcriptAvailable: true,
      transcript: lines.join("\n").slice(0, 14000),
    })
  }
}

export class GitHubInspectorTool extends StructuredTool {
  name = "github_repo_inspector"
  description =
    "Inspect any public GitHub repository (stats, README excerpt, recent open issues, or latest releases) without OAuth."
  schema = z.object({
    repo: z.string().describe("Repository in 'owner/name' format or full https://github.com/owner/name URL"),
    include: z
      .enum(["overview", "issues", "releases", "readme"])
      .optional()
      .default("overview")
      .describe("Which details to fetch"),
  })

  async _call({ repo, include }: z.infer<typeof this.schema>): Promise<string> {
    const cleaned = repo
      .trim()
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\.git$/i, "")
      .split("/")
      .slice(0, 2)
      .join("/")

    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(cleaned)) {
      throw new Error("Provide a valid repository like 'vercel/next.js'")
    }

    const apiHeaders = {
      Accept: "application/vnd.github+json",
    }

    const repoRes = await fetchWithTimeout(`https://api.github.com/repos/${cleaned}`, {
      headers: apiHeaders,
    })
    if (!repoRes.ok) {
      throw new Error(`GitHub API error (${repoRes.status}) for ${cleaned}`)
    }
    const repoJson = await repoRes.json()

    const result: Record<string, unknown> = {
      fullName: repoJson.full_name,
      description: repoJson.description,
      stars: repoJson.stargazers_count,
      forks: repoJson.forks_count,
      openIssues: repoJson.open_issues_count,
      language: repoJson.language,
      defaultBranch: repoJson.default_branch,
      url: repoJson.html_url,
    }

    if (include === "issues") {
      const issuesRes = await fetchWithTimeout(
        `https://api.github.com/repos/${cleaned}/issues?state=open&per_page=8`,
        { headers: apiHeaders }
      )
      if (issuesRes.ok) {
        const issues = await issuesRes.json()
        result.recentIssues = (issues as any[]).map((i) => ({
          number: i.number,
          title: i.title,
          author: i.user?.login,
          isPR: Boolean(i.pull_request),
          url: i.html_url,
        }))
      }
    } else if (include === "releases") {
      const relRes = await fetchWithTimeout(
        `https://api.github.com/repos/${cleaned}/releases?per_page=5`,
        { headers: apiHeaders }
      )
      if (relRes.ok) {
        const releases = await relRes.json()
        result.releases = (releases as any[]).map((r) => ({
          tag: r.tag_name,
          name: r.name,
          publishedAt: r.published_at,
          notes: (r.body || "").slice(0, 600),
        }))
      }
    } else {
      const readmeRes = await fetchWithTimeout(
        `https://api.github.com/repos/${cleaned}/readme`,
        { headers: { Accept: "application/vnd.github.raw+json" } }
      )
      if (readmeRes.ok) {
        const readme = await readmeRes.text()
        result.readmeExcerpt = readme.slice(0, 6000)
      }
    }

    return JSON.stringify(result)
  }
}

export interface ConfiguredWebhooks {
  discord?: string
  slack?: string
}

function validateWebhookUrl(rawUrl: string, target: "discord" | "slack"): string {
  const parsed = new URL(rawUrl.trim())
  if (parsed.protocol !== "https:") {
    throw new Error("Webhook URL must use https")
  }
  const host = parsed.hostname.toLowerCase()
  if (target === "discord" && host !== "discord.com" && host !== "discordapp.com") {
    throw new Error("Invalid Discord webhook host")
  }
  if (target === "slack" && host !== "hooks.slack.com") {
    throw new Error("Invalid Slack webhook host")
  }
  return parsed.toString()
}

export class WebhookPushTool extends StructuredTool {
  name = "send_webhook_notification"
  description =
    "Send a formatted notification, summary, or alert to the user's configured Discord or Slack webhook."
  schema = z.object({
    target: z.enum(["discord", "slack"]).describe("Target platform webhook"),
    title: z.string().describe("Short title for the message"),
    message: z.string().describe("Markdown or plain-text body to send"),
  })

  private webhooks: ConfiguredWebhooks

  constructor(webhooks: ConfiguredWebhooks) {
    super()
    this.webhooks = webhooks
  }

  async _call({ target, title, message }: z.infer<typeof this.schema>): Promise<string> {
    const rawUrl = this.webhooks[target]
    if (!rawUrl) {
      throw new Error(`No ${target} webhook URL configured. Ask the user to add it in API Keys & Webhooks.`)
    }

    const webhookUrl = validateWebhookUrl(rawUrl, target)
    const payload =
      target === "discord"
        ? { content: `**${title}**\n${message}`.slice(0, 1950) }
        : { text: `*${title}*\n${message}`.slice(0, 3900) }

    const res = await fetchWithTimeout(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error(`Webhook delivery failed (${res.status})`)
    }

    return JSON.stringify({
      delivered: true,
      target,
      title,
    })
  }
}
