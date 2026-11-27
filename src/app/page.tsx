"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Check,
  ArrowRight,
  Zap,
  Globe,
  KeyRound,
  Lock,
  SlidersHorizontal,
  Sun,
  Columns2,
  Mic,
  PanelRightOpen,
  Webhook,
  RefreshCw,
  Briefcase,
} from "lucide-react"
import {
  SiGooglegemini,
  SiNvidia,
  SiOpenai,
  SiGmail,
  SiGooglecalendar,
  SiGoogledocs,
  SiYoutube,
  SiGithub,
} from "react-icons/si"
import { RageLogo } from "@/components/rage-logo"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"
import {
  HeroCrystalShards,
  HeroIsometricStack,
  WireframeOAuthShield,
  WireframeApiKeysChip,
  WireframeAgentTerminal,
  InteroperableStackDiagram,
  BottomCtaPrism,
} from "@/components/landing-visuals"

const CAPABILITIES = [
  {
    id: "jobs",
    label: "Job Match & Outreach",
    detail: "Scrape live roles for your resume, save a Docs brief, draft Gmail outreach, schedule follow-ups & alert Discord.",
    prompt: "Scrape best AI engineer jobs for my resume, draft outreach & push to Discord.",
    highlightTiles: ["Gmail", "Calendar", "Docs"],
  },
  {
    id: "chat",
    label: "Workspace Chat",
    detail: "Switch freely between Gemini 3.8 Flash, NVIDIA Nemotron 3.5, and OpenAI GPT-5 with auto-failover.",
    prompt: "Compare our Q4 launch notes with last week's sprint summary.",
    highlightTiles: ["Gemini", "Nemotron", "ChatGPT"],
  },
  {
    id: "gmail",
    label: "Gmail Triage",
    badge: "on demand",
    detail: "Summarize unread threads, search your inbox, and draft outreach or replies before sending.",
    prompt: "Summarize unread emails from design@ and draft a concise reply.",
    highlightTiles: ["Gmail", "Gemini"],
  },
  {
    id: "calendar",
    label: "Calendar Sync",
    detail: "Check availability, schedule interviews or follow-ups with Google Meet, and update times.",
    prompt: "Find a free 30-min slot tomorrow afternoon and book Project Sync.",
    highlightTiles: ["Calendar", "Nemotron"],
  },
  {
    id: "docs",
    label: "Docs & Web Intel",
    detail: "Create Google Docs, summarize YouTube videos, inspect GitHub repos, and read any URL.",
    prompt: "Summarize this YouTube talk and create a clean Google Doc brief.",
    highlightTiles: ["Docs", "ChatGPT"],
  },
]

const INTEGRATION_TOP_ROW = [
  { name: "Gemini", tag: "Free", icon: SiGooglegemini },
  { name: "Nemotron", tag: "Free", icon: SiNvidia },
  { name: "ChatGPT", tag: "BYOK", icon: SiOpenai },
]

const INTEGRATION_BOTTOM_ROW = [
  { name: "Gmail", tag: "Google", icon: SiGmail },
  { name: "Calendar", tag: "Google", icon: SiGooglecalendar },
  { name: "Docs", tag: "Google", icon: SiGoogledocs },
]

const WORKFLOW_SCENARIOS = [
  {
    id: "calendar",
    label: "Calendar",
    icon: SiGooglecalendar,
    model: "Gemini 3.8 Flash",
    prompt:
      "Hey @RageAI check my calendar for tomorrow afternoon and draft a 3 PM meeting invite with Sarah.",
    toolTrace: "Calendar checked • 3:00 PM IST is free",
    toolsUsed: ["calendar_get_events", "calendar_create_event"],
    response:
      "I've prepared the event Project Sync for tomorrow 3:00–3:30 PM with Google Meet attached. Does this look good?",
  },
  {
    id: "gmail",
    label: "Gmail",
    icon: SiGmail,
    model: "Nemotron 3.5 Super",
    prompt: "Hey @RageAI find the latest invoice from Acme Cloud and draft a confirmation reply.",
    toolTrace: "Gmail searched • 1 thread matched",
    toolsUsed: ["gmail_search", "gmail_create_draft"],
    response:
      "Found Invoice #4082 ($149.00, due Friday). Saved a polite confirmation draft in Gmail for your review.",
  },
  {
    id: "docs",
    label: "Docs",
    icon: SiGoogledocs,
    model: "GPT-5 Chat",
    prompt:
      "Hey @RageAI create a Google Doc titled Q4 Release Checklist with engineering and QA sections.",
    toolTrace: "Google Doc created • 3 sections formatted",
    toolsUsed: ["docs_create_document", "docs_format_document"],
    response:
      "Created Q4 Release Checklist in your Drive with structured headings and checkboxes. Want me to share it?",
  },
  {
    id: "search",
    label: "Web Search",
    icon: Globe,
    model: "Gemini 3.5 Flash-Lite",
    prompt: "Hey @RageAI look up NVIDIA NIM free-tier quotas and summarize what's included.",
    toolTrace: "Tavily web search • 5 sources synthesized",
    toolsUsed: ["tavily_search", "read_webpage"],
    response:
      "Summarized current NVIDIA NIM free developer quotas, supported Nemotron 3.5 endpoints, and API base URL details.",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: SiYoutube,
    model: "Gemini 3.8 Flash",
    prompt: "Hey @RageAI summarize this keynote video and send the notes to Discord.",
    toolTrace: "Transcript extracted • Pushed to Discord webhook",
    toolsUsed: ["youtube_transcript", "send_webhook_notification"],
    response:
      "Extracted timestamped key takeaways from the 42-min keynote and posted the formatted digest to your Discord channel.",
  },
  {
    id: "jobs",
    label: "Job Matcher",
    icon: Briefcase,
    model: "Gemini 3.8 Flash",
    prompt:
      "Hey @RageAI scrape best AI engineer jobs for my resume, draft outreach mail, save to Docs & push to Discord.",
    toolTrace: "Jobs scraped (410ms) • Docs & Discord updated",
    toolsUsed: [
      "scrape_jobs",
      "google_docs_create_document",
      "gmail_create_draft",
      "google_calendar_create_event",
      "send_webhook_notification",
    ],
    response:
      "Matched 5 top remote roles (94% top fit). Saved your tailored Job Brief in Docs, drafted 2 Gmail outreach emails, scheduled a Friday follow-up, and posted the digest to Discord.",
  },
  {
    id: "briefing",
    label: "Morning Briefing",
    icon: Sun,
    model: "Gemini 3.8 Flash",
    prompt:
      "Hey @RageAI give me my Morning Briefing from Calendar, Gmail, and top AI headlines.",
    toolTrace: "Calendar (180ms) • Gmail (310ms) • Web (290ms)",
    toolsUsed: ["google_calendar_get_events", "gmail_search", "tavily_search"],
    response:
      "You have 2 meetings today (11:00 AM Design Sync, 3:00 PM Sprint Review), 3 priority unread threads, and 5 AI release updates ready to push to Discord.",
  },
  {
    id: "github",
    label: "GitHub",
    icon: SiGithub,
    model: "Nemotron 3.5 Super",
    prompt: "Hey @RageAI inspect vercel/next.js latest releases and open issues.",
    toolTrace: "GitHub inspected • 5 releases & 8 issues (240ms)",
    toolsUsed: ["github_repo_inspector"],
    response:
      "Compiled a crisp changelog summary for the latest Next.js releases along with top active issues—openable in Artifact Preview.",
  },
]

const POWER_SUITE = [
  {
    title: "Resume Job Scraper & Outreach",
    accent: "Scrape, match & apply",
    description:
      "Scrape live jobs matching your resume, save a tailored brief to Docs, draft Gmail outreach, schedule follow-ups, and alert Discord.",
    icon: Briefcase,
  },
  {
    title: "Morning Briefing",
    accent: "1-click daily digest",
    description:
      "Pulls today's Calendar events, unread Gmail threads, and live web headlines into a single structured brief.",
    icon: Sun,
  },
  {
    title: "YouTube, URLs & GitHub",
    accent: "Zero OAuth required",
    description:
      "Extract timestamped YouTube transcripts, read any public webpage URL, and inspect GitHub repos, issues & releases.",
    icon: SiYoutube,
  },
  {
    title: "Versus & Auto-Failover",
    accent: "Multi-model resilience",
    description:
      "Compare two models side-by-side in parallel or auto-failover seamlessly if a free-tier key hits a rate limit.",
    icon: Columns2,
  },
  {
    title: "Discord & Slack Webhooks",
    accent: "Channel push alerts",
    description:
      "Paste an incoming webhook URL once and let Rage AI push matched jobs, daily briefings, and alerts to your channels.",
    icon: Webhook,
  },
  {
    title: "Voice & Artifact Preview",
    accent: "Dictate, preview & export",
    description:
      "Speak commands with browser voice input, render HTML/SVG/Markdown in a preview drawer, and export .md or .ics.",
    icon: PanelRightOpen,
  },
]

const PROVIDER_GROUPS = [
  {
    provider: "Google Gemini",
    tier: "Free Tier • AI Studio",
    description: "Fast multimodal reasoning with generous Google AI Studio free-tier quotas.",
    models: [
      { name: "Gemini 3.8 Flash", tag: "Default" },
      { name: "Gemini 3.5 Flash-Lite", tag: "Ultra Fast" },
      { name: "Gemini Flash Latest", tag: "Free Tier" },
      { name: "Gemini 2.5 Flash", tag: "Stable" },
    ],
  },
  {
    provider: "NVIDIA Nemotron",
    tier: "Free Tier • NVIDIA NIM",
    description: "Open-weights reasoning & speed routed directly via integrate.api.nvidia.com.",
    models: [
      { name: "Nemotron 3.5 Super 120B", tag: "120B" },
      { name: "Nemotron 3.5 Lightning 30B", tag: "Fast" },
      { name: "Llama 3.3 Nemotron 49B", tag: "Reasoning" },
      { name: "Nemotron 3.5 Bolt E4B", tag: "Lightweight" },
    ],
  },
  {
    provider: "OpenAI / ChatGPT",
    tier: "BYOK • OpenAI API",
    description: "Drop in your OpenAI API key for GPT-5 and GPT-4o models inside the same chat.",
    models: [
      { name: "GPT-5", tag: "Latest" },
      { name: "GPT-5 Chat", tag: "Latest" },
      { name: "GPT-4o", tag: "Balanced" },
      { name: "GPT-4o Mini", tag: "Fast" },
    ],
  },
]

const SETUP_STEPS = [
  {
    step: "01",
    title: "Minimal Google Sign-In",
    description:
      "Sign in with basic openid, email, and profile only. No bloated upfront workspace permission walls.",
    icon: Lock,
  },
  {
    step: "02",
    title: "Add Keys, Webhooks & Resume",
    description:
      "Paste free Gemini, NVIDIA NIM, or OpenAI keys—plus optional Discord/Slack webhooks and your resume—stored locally in your browser.",
    icon: KeyRound,
  },
  {
    step: "03",
    title: "Connect & Run Workflows",
    description:
      "Toggle Gmail, Calendar, or Docs on demand, then launch Job Match, Morning Briefing, or Versus comparisons in one click.",
    icon: SlidersHorizontal,
  },
]

function renderPromptWithMention(prompt: string) {
  const parts = prompt.split("@RageAI")
  if (parts.length === 1) return prompt
  return (
    <>
      {parts[0]}
      <span className="rounded bg-red-500/20 px-1 py-0.5 text-red-300 font-medium">@RageAI</span>
      {parts[1]}
    </>
  )
}

export default function LandingPage() {
  const [activeCap, setActiveCap] = useState("jobs")
  const [activeWorkflow, setActiveWorkflow] = useState("jobs")

  const activeCapability = CAPABILITIES.find((c) => c.id === activeCap) || CAPABILITIES[0]
  const currentWorkflow =
    WORKFLOW_SCENARIOS.find((w) => w.id === activeWorkflow) || WORKFLOW_SCENARIOS[0]

  return (
    <div className="min-h-screen bg-[#0b0909] text-white selection:bg-red-500/30 selection:text-white overflow-x-hidden">
      {/* Subtle top ambient crimson glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(220,38,38,0.2),rgba(127,29,29,0.06)_55%,transparent_100%)] z-0"
      />

      {/* Minimal Reference-Style Header: Centered Logo Mark + Mobile & Desktop Actions */}
      <header className="relative z-20 mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="hidden sm:flex items-center gap-5 text-[11px] font-medium text-zinc-500">
          <a href="#features" className="hover:text-zinc-200 transition-colors">
            Capabilities
          </a>
          <a href="#workflows" className="hover:text-zinc-200 transition-colors">
            Workflows
          </a>
          <a href="#architecture" className="hover:text-zinc-200 transition-colors">
            Models
          </a>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center h-8 w-8 rounded-lg bg-white text-[#0b0909] shadow-lg shadow-red-950/40 hover:scale-105 transition-transform"
          aria-label="Rage AI Home"
        >
          <RageLogo variant="red" className="h-5 w-5" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/auth/signin"
            className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signin"
            className="rounded-full bg-[#f5f5f5] px-3.5 py-1.5 text-[11px] font-semibold text-[#0b0909] hover:bg-white transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-24 text-center">
          <HeroCrystalShards />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto max-w-2xl space-y-4 sm:space-y-5"
          >
            <h1 className="text-[34px] font-semibold tracking-tight text-white sm:text-5xl md:text-[54px] leading-[1.08]">
              Run your workspace
              <br />
              <span className="bg-gradient-to-r from-white via-red-100 to-red-400 bg-clip-text text-transparent">
                10x more efficiently
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Match <span className="text-red-400">live jobs to your resume</span>, automate{" "}
              <span className="text-red-400">Gmail, Calendar &amp; Docs</span>, summarize{" "}
              <span className="text-red-400">YouTube &amp; GitHub</span>, and push{" "}
              <span className="text-red-400">Discord/Slack alerts</span> with free-tier Gemini,
              NVIDIA Nemotron, or OpenAI keys.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/auth/signin"
                className="rounded-full bg-[#f5f5f5] px-5 py-2 text-xs font-semibold text-[#0b0909] shadow-lg shadow-red-950/25 hover:bg-white transition-all"
              >
                Start chatting
              </Link>
              <a
                href="#features"
                className="rounded-full border border-white/10 bg-[#141010] px-5 py-2 text-xs font-medium text-zinc-300 hover:border-red-500/35 hover:text-white transition-all"
              >
                How it works
              </a>
            </div>
          </motion.div>

          {/* Hero Isometric Architecture Showcase (Open Floating Reference Layout) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative z-10 mx-auto mt-10 sm:mt-14 max-w-4xl pt-2 sm:pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-8">
              {/* Left Minimalist Selector (pill wrap on mobile, vertical list on md+) */}
              <div className="md:col-span-4 text-center md:text-left space-y-2.5 md:pl-2">
                <div className="flex flex-wrap justify-center md:flex-col md:items-start gap-2 md:gap-2.5">
                  {CAPABILITIES.map((cap) => {
                    const isActive = cap.id === activeCap
                    return (
                      <button
                        key={cap.id}
                        type="button"
                        onClick={() => setActiveCap(cap.id)}
                        className={`inline-flex md:w-full items-center gap-1.5 md:gap-2 rounded-full md:rounded-none border md:border-0 px-3 py-1 md:p-0 text-left text-xs transition-colors cursor-pointer ${
                          isActive
                            ? "border-red-500/40 bg-red-500/10 md:bg-transparent text-white font-medium"
                            : "border-white/10 text-zinc-500 md:text-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        <span
                          className={`hidden md:inline text-[9px] transition-opacity ${
                            isActive ? "text-red-500 opacity-100" : "opacity-0"
                          }`}
                        >
                          &#9654;
                        </span>
                        <span>{cap.label}</span>
                        {cap.badge && (
                          <span className="hidden md:inline text-[9px] text-zinc-600 font-normal">
                            ({cap.badge})
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="pt-2 md:pt-3 md:pl-4 text-[11px] leading-relaxed text-zinc-500 max-w-xs mx-auto md:mx-0 md:max-w-[240px]">
                  {activeCapability.detail}
                </p>
              </div>

              {/* Center Stacked Isometric Plates */}
              <div className="md:col-span-4 flex flex-col items-center justify-center">
                <HeroIsometricStack />
              </div>

              {/* Right Staggered Squircle Tiles */}
              <div className="md:col-span-4 flex flex-col items-center gap-2.5">
                {[INTEGRATION_TOP_ROW, INTEGRATION_BOTTOM_ROW].map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-3 gap-2.5">
                    {row.map((tile) => {
                      const Icon = tile.icon
                      const isHighlighted = activeCapability.highlightTiles.includes(tile.name)
                      return (
                        <div
                          key={tile.name}
                          className={`flex h-16 w-16 flex-col items-center justify-center gap-1.5 rounded-2xl border transition-all ${
                            isHighlighted
                              ? "border-red-500/40 bg-[#1c1313] shadow-[0_0_20px_rgba(239,68,68,0.16)]"
                              : "border-white/[0.07] bg-[#141010]/90 opacity-75"
                          }`}
                        >
                          <Icon className="h-5 w-5 text-zinc-200" />
                          <span className="text-[9px] font-medium text-zinc-400">{tile.name}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Open Hairline 3-Column Bento with Wireframe Line-Art */}
        <section id="features" className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-xl text-center space-y-4 mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Automate your everyday
              <br />
              workspace tasks
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Rage AI stays simple and lightweight — connect only the{" "}
              <span className="text-red-400">Google tools</span> you need and power everything
              with your own <span className="text-red-400">free-tier or API keys</span>.
            </p>
            <div className="pt-2">
              <Link
                href="/auth/signin"
                className="inline-block rounded-full bg-[#f5f5f5] px-5 py-2 text-xs font-semibold text-[#0b0909] hover:bg-white transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="relative border-l border-white/[0.08] pl-6 pr-2 pt-1 pb-2 flex flex-col justify-between min-h-[270px]">
              <div className="absolute top-0 left-0 h-2.5 w-2.5 bg-red-500 [clip-path:polygon(0_0,100%_0,0_100%)]" />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white">Minimal OAuth permissions</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Sign in with basic Google profile only.{" "}
                  <span className="text-red-400">Selectively authorize</span> Gmail, Google
                  Calendar, or Google Docs individually whenever you want.
                </p>
              </div>
              <div className="pt-8 flex justify-center">
                <WireframeOAuthShield />
              </div>
            </div>

            {/* Column 2 */}
            <div className="relative border-l border-white/[0.08] pl-6 pr-2 pt-1 pb-2 flex flex-col justify-between min-h-[270px]">
              <div className="absolute top-0 left-0 h-2.5 w-2.5 bg-rose-400 [clip-path:polygon(0_0,100%_0,0_100%)]" />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white">Auto-failover &amp; Versus mode</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Plug in free-tier <span className="text-red-400">Gemini</span>,{" "}
                  <span className="text-red-400">Nemotron</span>, or OpenAI keys. Compare models{" "}
                  <span className="text-red-400">side-by-side</span> or auto-failover seamlessly
                  if a free tier hits a rate limit.
                </p>
              </div>
              <div className="pt-8 flex justify-center">
                <WireframeApiKeysChip />
              </div>
            </div>

            {/* Column 3 */}
            <div className="relative border-l border-white/[0.08] pl-6 pr-2 pt-1 pb-2 flex flex-col justify-between min-h-[270px]">
              <div className="absolute top-0 left-0 h-2.5 w-2.5 bg-orange-400 [clip-path:polygon(0_0,100%_0,0_100%)]" />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white">Zero-OAuth built-in tools</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Read webpages, summarize <span className="text-red-400">YouTube transcripts</span>,
                  inspect <span className="text-red-400">GitHub repos</span>, preview HTML
                  artifacts, dictate via voice, and push alerts to{" "}
                  <span className="text-red-400">Discord or Slack</span> webhooks.
                </p>
              </div>
              <div className="pt-8 flex justify-center">
                <WireframeAgentTerminal />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Split Feature Showcase with Top/Bottom Faded Thread */}
        <section id="workflows" className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl border border-white/[0.07] bg-[#130f0f] overflow-hidden">
            <div className="p-8 sm:p-14 flex flex-col justify-center space-y-5">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug">
                  Turn plain English into
                  <br />
                  completed tasks
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
                  Rage AI connects natural language directly to your authorized tools — so you can{" "}
                  <span className="text-red-400">triage mail</span>, check schedules, and{" "}
                  <span className="text-red-400">draft docs</span> without switching tabs.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {WORKFLOW_SCENARIOS.map((scenario) => {
                  const Icon = scenario.icon
                  const isActive = scenario.id === activeWorkflow
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => setActiveWorkflow(scenario.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-red-500/15 text-white border border-red-500/35"
                          : "border border-white/[0.08] bg-[#0e0b0b] text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <Icon className={`h-3 w-3 ${isActive ? "text-red-400" : "text-zinc-500"}`} />
                      <span>{scenario.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {currentWorkflow.toolsUsed.map((tool) => (
                  <code
                    key={tool}
                    className="rounded border border-white/[0.08] bg-[#0c0909] px-2 py-0.5 text-[10px] text-red-300/90"
                  >
                    {tool}
                  </code>
                ))}
              </div>
            </div>

            {/* Right Inset Thread Panel with Reference Top/Bottom Fade */}
            <div className="border-t lg:border-t-0 lg:border-l border-white/[0.07] bg-[#181313]/70 p-6 sm:p-10 flex items-center justify-center">
              <div
                className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#120e0e] px-5 py-7 space-y-4"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 14%, black 82%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, black 14%, black 82%, transparent 100%)",
                }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-[11px] text-zinc-500">
                  <span>Thread &nbsp; # workspace-assistant</span>
                  <span className="text-[10px] text-red-300/90">{currentWorkflow.model}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-white/[0.06] bg-[#1a1414] p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-rose-700 text-[10px] font-semibold text-white">
                        R
                      </span>
                      <span className="text-[11px] font-semibold text-white">You</span>
                      <span className="text-[10px] text-zinc-500">just now</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {renderPromptWithMention(currentWorkflow.prompt)}
                    </p>
                    <div className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#120e0e] px-2 py-0.5 text-[10px] text-zinc-400">
                      <Zap className="h-2.5 w-2.5 text-red-400" />
                      <span>1</span>
                    </div>
                  </div>

                  <div className="pl-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-red-300/90">
                      <Check className="h-3 w-3 shrink-0" />
                      <span>{currentWorkflow.toolTrace}</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">{currentWorkflow.response}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Power Suite Feature Grid */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-500">
                Built-in toolkit
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                More than a chat box.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#120e0e] px-3 py-1">
                <RefreshCw className="h-3 w-3 text-red-400" />
                Live tool traces
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#120e0e] px-3 py-1">
                <Mic className="h-3 w-3 text-red-400" />
                Voice commands
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POWER_SUITE.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/[0.07] bg-[#110d0d] p-5 space-y-2.5 hover:border-red-500/35 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium text-red-400">{item.accent}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 4: Multi-Model by Design + Dual Floating Isometric Diagram */}
        <section id="architecture" className="mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="mx-auto max-w-xl space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Multi-model by design
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Use <span className="text-red-400">Google Gemini free-tier</span> models,{" "}
              <span className="text-red-400">NVIDIA Nemotron</span> free NIM endpoints, or OpenAI
              ChatGPT models — all inside one unified workspace assistant.
            </p>
          </div>

          <InteroperableStackDiagram />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {PROVIDER_GROUPS.map((group) => (
              <div
                key={group.provider}
                className="rounded-2xl border border-white/[0.07] bg-[#120e0e] p-5 flex flex-col justify-between hover:border-red-500/30 transition-colors"
              >
                <div className="space-y-1.5 mb-4">
                  <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-red-400">
                    {group.tier}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{group.provider}</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{group.description}</p>
                </div>

                <div className="space-y-1.5">
                  {group.models.map((model) => (
                    <div
                      key={model.name}
                      className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-[#0b0909] px-3 py-1.5 text-[11px]"
                    >
                      <span className="text-zinc-200">{model.name}</span>
                      <span className="text-[10px] text-zinc-500">{model.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: 3-Step Setup Strip */}
        <section id="setup" className="mx-auto max-w-5xl px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-3xl border border-white/[0.07] bg-[#110d0d] p-7 sm:p-10">
            {SETUP_STEPS.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-red-400 font-semibold">STEP {item.step}</span>
                    <Icon className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 6: Reference-Style Bottom CTA Card with Crimson 3D Prism */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/[0.07] bg-[#130f0f] overflow-hidden">
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="p-8 sm:p-12 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-400">
                  Ready to simplify your workflow?
                </h2>
                <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Start with Rage AI today.
                </p>
              </div>

              <div className="border-t border-white/[0.07] px-8 sm:px-12 py-5 flex flex-wrap items-center justify-between gap-3 bg-[#0e0b0b]/70">
                <span className="text-xs text-zinc-500">
                  Sign in with Google &amp; paste your API key
                </span>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-4 py-1.5 text-xs font-semibold text-[#0b0909] hover:bg-white transition-colors"
                >
                  <span>Get started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/[0.07]">
              <BottomCtaPrism />
            </div>
          </div>
        </section>

        {/* Subtle Interactive Crimson Wordmark */}
        <section aria-hidden="true" className="mx-auto max-w-5xl px-6 pb-8 hidden sm:block">
          <div className="h-24 md:h-32 flex items-center justify-center opacity-75">
            <TextHoverEffect text="RAGE AI" />
          </div>
        </section>
      </main>

      {/* Editorial Reference Footer */}
      <footer className="relative z-10 bg-[#050404] border-t border-white/[0.06] pt-14 sm:pt-20 pb-10 sm:pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-10 sm:space-y-16">
          {/* Upper Oversized Statement + Red Inline Accents */}
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-6xl font-bold tracking-tight text-white leading-[0.96]">
              Let&apos;s automate
              <br />
              something <span className="text-red-500">great.</span>
            </h2>
            <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed max-w-xl">
              Built for fast-moving builders, Rage AI turns{" "}
              <span className="text-red-500">natural language</span> into{" "}
              <span className="text-red-500">resume-matched jobs</span>,{" "}
              <span className="text-red-500">workspace execution</span>, and{" "}
              <span className="text-red-500">multi-model intelligence</span>. Connect minimal
              Google OAuth scopes on demand, bring free-tier Gemini or NVIDIA NIM keys, and keep
              complete control over every outreach draft, calendar invite, doc, and webhook in your
              browser.
            </p>
          </div>

          {/* Middle Brand + Navigation + Contact Grid */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
            <div className="flex items-start gap-6">
              <Link
                href="/"
                aria-label="Rage AI"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] hover:border-red-500/40 transition-colors"
              >
                <RageLogo variant="white" className="h-7 w-7 text-white" />
              </Link>
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-white tracking-tight">rage:ai</p>
                <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-400">
                  <a href="#features" className="hover:text-white transition-colors">
                    Capabilities
                  </a>
                  <a href="#workflows" className="hover:text-white transition-colors">
                    Workflows
                  </a>
                  <a href="#architecture" className="hover:text-white transition-colors">
                    Models
                  </a>
                  <Link href="/auth/signin" className="hover:text-white transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white w-20">Start now</span>
                <Link
                  href="/auth/signin"
                  className="text-red-500 hover:text-red-400 transition-colors font-medium"
                >
                  launch.rageai.app
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white w-20">Workspace</span>
                <div className="flex items-center gap-3 text-red-500 font-medium">
                  <a href="#workflows" className="hover:text-red-400 transition-colors">
                    Gmail
                  </a>
                  <a href="#workflows" className="hover:text-red-400 transition-colors">
                    Calendar
                  </a>
                  <a href="#workflows" className="hover:text-red-400 transition-colors">
                    Docs
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white w-20">Models</span>
                <div className="flex items-center gap-3 text-red-500 font-medium">
                  <a href="#architecture" className="hover:text-red-400 transition-colors">
                    Gemini
                  </a>
                  <a href="#architecture" className="hover:text-red-400 transition-colors">
                    Nemotron
                  </a>
                  <a href="#architecture" className="hover:text-red-400 transition-colors">
                    OpenAI
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Horizontal Divider Strip */}
          <div className="flex items-center gap-2.5 sm:gap-8 text-[10px] sm:text-[11px] font-medium text-zinc-200">
            <span className="shrink-0">Google AI Studio</span>
            <span className="h-px flex-1 bg-white/15" />
            <span className="shrink-0 text-red-400">NVIDIA NIM</span>
            <span className="h-px flex-1 bg-white/15" />
            <span className="shrink-0">OpenAI BYOK</span>
          </div>

          {/* Bottom Legal Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 text-[11px]">
            <div className="flex items-center gap-6 text-zinc-300 font-medium">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-zinc-500 font-normal">
                &copy; {new Date().getFullYear()} Rage AI
              </span>
            </div>

            <p className="text-zinc-400">
              Rage AI workspace is powered by{" "}
              <span className="text-red-500 font-medium">Rage AI Studio</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
