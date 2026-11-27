"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Clock,
  Copy,
  IndianRupee,
  Sparkles,
  Terminal,
} from "lucide-react"
import { RageLogo } from "@/components/rage-logo"
import { HeroCrystalShards } from "@/components/landing-visuals"
import { toast } from "sonner"

const RESPONSIBILITIES = [
  "Build responsive, high-craft UI components with Next.js (App Router), React, TypeScript, and Tailwind CSS.",
  "Design and maintain REST & streaming API routes, NextAuth/Google OAuth flows, and PostgreSQL schemas via Prisma.",
  "Integrate multi-model AI workflows (Gemini, NVIDIA Nemotron, OpenAI), web scrapers, and external webhooks.",
  "Own features end-to-end from prototype to production deployments on Vercel, including mobile responsiveness and bug fixes.",
]

const REQUIREMENTS = [
  "Strong fundamentals in JavaScript / TypeScript, React / Next.js, and Tailwind CSS.",
  "Hands-on familiarity with REST APIs, PostgreSQL (or Prisma ORM), and Git / GitHub workflows.",
  "High ownership, fast execution speed, and comfort debugging independently.",
  "Bonus: experience with LangChain / LangGraph, LLM APIs, or OAuth integrations.",
]

const TECH_STACK = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS v4",
  "PostgreSQL & Prisma",
  "LangGraph",
  "NextAuth",
  "Vercel",
]

const APPLICATION_TEMPLATE = `Subject: Application for SDE Intern – [Your Name]

Hi Rage AI Team,

I'm applying for the Software Development Engineer (3-Month Unpaid Internship -> ₹20,000/mo performance-based) role at Rage AI (https://www.rageai.live).

- Name:
- GitHub:
- Portfolio / Resume Link:
- 1–2 Live Projects I've Built:
- Availability (Start Date & Hours/Week):`

export default function CareersPage() {
  const [copied, setCopied] = useState(false)

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(APPLICATION_TEMPLATE)
      setCopied(true)
      toast.success("Application template copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy template")
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0b0909] text-white relative overflow-hidden">
      {/* Ambient crimson glow + grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(220,38,38,0.22),rgba(127,29,29,0.06)_55%,transparent_100%)] z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.14] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_30%,#000_35%,transparent_100%)] bg-[linear-gradient(to_right,rgba(239,68,68,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.16)_1px,transparent_1px)] bg-[size:44px_44px]"
      />

      {/* Header */}
      <header className="relative z-20 mx-auto flex h-16 sm:h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#141010]/90 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-500/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Rage AI</span>
        </Link>

        <Link
          href="/"
          className="hidden sm:flex items-center justify-center h-8 w-8 rounded-lg bg-white text-[#0b0909] shadow-lg shadow-red-950/40"
          aria-label="Rage AI"
        >
          <RageLogo variant="red" className="h-5 w-5" />
        </Link>

        <Link
          href="/auth/signin"
          className="rounded-full bg-[#f5f5f5] px-3.5 py-1.5 text-[11px] font-semibold text-[#0b0909] hover:bg-white transition-colors"
        >
          Launch App
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pt-8 pb-20 space-y-12">
        <HeroCrystalShards />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/[0.08] px-3.5 py-1 text-[11px] font-medium text-red-200">
            <Sparkles className="h-3.5 w-3.5 text-red-400" />
            <span>We&apos;re Hiring • Engineering</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.08]">
            Build the future of{" "}
            <span className="bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent">
              Rage AI
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Work directly on production code across Next.js, LangGraph, and PostgreSQL. Start with a
            focused <span className="text-red-400">3-month unpaid internship</span> and convert to{" "}
            <span className="text-red-400">₹20,000/month</span> based on performance.
          </p>
        </motion.div>

        {/* Job Listing Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="relative z-10 rounded-3xl p-px bg-gradient-to-b from-red-500/40 via-white/10 to-white/[0.04] shadow-[0_24px_70px_rgba(220,38,38,0.18)]"
        >
          <div className="rounded-[23px] bg-[#120e0e]/95 backdrop-blur-xl p-6 sm:p-10 space-y-8">
            {/* Role Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-red-400">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Open Position</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Software Development Engineer (SDE Intern &rarr; Full-Time)
                </h2>
                <p className="text-xs text-zinc-400">
                  Rage AI &bull; Remote / Hybrid &bull; Direct mentorship &amp; production ownership
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0b0909] px-3 py-1 text-[11px] text-zinc-300">
                  <Clock className="h-3 w-3 text-red-400" />
                  3 Mo Unpaid Intern
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/35 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-200">
                  <IndianRupee className="h-3 w-3 text-red-400" />
                  20,000 / mo after
                </span>
              </div>
            </div>

            {/* Compensation & Conversion Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d0a0a] p-4 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Months 1 – 3
                </span>
                <h3 className="text-sm font-semibold text-white">Unpaid Internship Sprint</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Weekly production goals, code reviews, and hands-on mentorship shipping real
                  features on <span className="text-red-400">rageai.live</span>.
                </p>
              </div>
              <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-4 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">
                  Month 4 Onward
                </span>
                <h3 className="text-sm font-semibold text-white">
                  ₹20,000 / month (Performance-Based)
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Convert to paid SDE upon hitting ownership, code quality, and shipping milestones
                  — plus Certificate &amp; Letter of Recommendation.
                </p>
              </div>
            </div>

            {/* Responsibilities & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-red-400" />
                  <span>What You&apos;ll Do</span>
                </h3>
                <ul className="space-y-2.5">
                  {RESPONSIBILITIES.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                      <Check className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-red-400" />
                  <span>What We Look For</span>
                </h3>
                <ul className="space-y-2.5">
                  {REQUIREMENTS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                      <Check className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-zinc-500 mr-1">Stack:</span>
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/[0.08] bg-[#0b0909] px-3 py-1 text-[11px] text-zinc-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Apply Action Bar */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0b0909] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Ready to apply?</h3>
                <p className="text-xs text-zinc-400">
                  Share your resume, GitHub profile, and 1–2 live projects you&apos;ve shipped.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#161111] px-4 py-2 text-xs font-medium text-zinc-200 hover:border-red-500/40 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-red-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span>{copied ? "Template Copied" : "Copy Apply Template"}</span>
                </button>
                <a
                  href={`mailto:careers@rageai.live?subject=${encodeURIComponent(
                    "Application for SDE Intern – Rage AI"
                  )}&body=${encodeURIComponent(APPLICATION_TEMPLATE)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff5757] to-[#dc2626] px-5 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
                >
                  <span>Apply via Email</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
