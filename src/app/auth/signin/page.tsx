"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react"
import {
  SiGooglegemini,
  SiNvidia,
  SiOpenai,
  SiGmail,
  SiGooglecalendar,
  SiGoogledocs,
} from "react-icons/si"
import { RageLogo } from "@/components/rage-logo"
import { HeroCrystalShards } from "@/components/landing-visuals"

const SAMPLE_PROMPTS = [
  {
    tag: "Morning Briefing",
    text: "Check today's calendar, summarize unread Gmail threads, and pull top AI headlines.",
  },
  {
    tag: "YouTube Summary",
    text: "Extract timestamps and key takeaways from this keynote video and save to Docs.",
  },
  {
    tag: "GitHub Inspector",
    text: "Inspect vercel/next.js latest releases and highlight breaking changes.",
  },
  {
    tag: "Calendar Sync",
    text: "Check tomorrow at 3 PM and draft a Project Sync invite with Google Meet.",
  },
]

const STACK_ICONS = [
  { name: "Gemini", icon: SiGooglegemini },
  { name: "Nemotron", icon: SiNvidia },
  { name: "ChatGPT", icon: SiOpenai },
  { name: "Gmail", icon: SiGmail },
  { name: "Calendar", icon: SiGooglecalendar },
  { name: "Docs", icon: SiGoogledocs },
]

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin:
    "Google OAuth couldn't start. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env and restart the server.",
  OAuthCallback:
    "Google OAuth callback failed. Verify your Authorized Redirect URI (/api/auth/callback/google) and DATABASE_URL.",
  Configuration:
    "NextAuth configuration error. Check NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in .env.",
  AccessDenied: "Google sign-in was cancelled or denied.",
  Default: "Unable to complete Google sign-in. Please check your OAuth credentials and try again.",
}

function GoogleColorIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.25-.96 2.31-2.05 3.02l3.31 2.57c1.93-1.78 3.04-4.4 3.04-7.5 0-.72-.06-1.41-.19-2.08H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.31-2.57c-.92.62-2.09.99-3.46.99-2.66 0-4.92-1.8-5.73-4.22H2.85v2.65A10.2 10.2 0 0 0 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.27 13.73A6.13 6.13 0 0 1 5.95 12c0-.6.11-1.18.32-1.73V7.62H2.85A10.2 10.2 0 0 0 1.8 12c0 1.65.4 3.21 1.05 4.38l3.42-2.65z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.05c1.5 0 2.85.52 3.91 1.53l2.93-2.93C17.07 3 14.76 2 12 2A10.2 10.2 0 0 0 2.85 7.62l3.42 2.65C7.08 7.85 9.34 6.05 12 6.05z"
      />
    </svg>
  )
}

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [activePromptIdx, setActivePromptIdx] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [oauthConfigured, setOauthConfigured] = useState<boolean | null>(null)

  const authError = searchParams.get("error")

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/chat")
    }
  }, [status, session, router])

  useEffect(() => {
    if (authError) {
      setIsRedirecting(false)
    }
  }, [authError])

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setOauthConfigured(Boolean(data?.oauthConfigured)))
      .catch(() => setOauthConfigured(null))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePromptIdx((prev) => (prev + 1) % SAMPLE_PROMPTS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const handleSignIn = () => {
    setIsRedirecting(true)
    signIn("google", { callbackUrl: "/chat" })
  }

  const activePrompt = SAMPLE_PROMPTS[activePromptIdx]
  const errorBannerText = authError
    ? OAUTH_ERROR_MESSAGES[authError] || OAUTH_ERROR_MESSAGES.Default
    : oauthConfigured === false
      ? "Google OAuth credentials are not set yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env."
      : null

  return (
    <div className="min-h-screen bg-[#0b0909] text-white relative overflow-hidden flex flex-col justify-between px-6 py-8">
      {/* Ambient crimson glow + architectural grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(220,38,38,0.22),rgba(127,29,29,0.06)_55%,transparent_100%)] z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.14] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_40%,#000_35%,transparent_100%)] bg-[linear-gradient(to_right,rgba(239,68,68,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.16)_1px,transparent_1px)] bg-[size:44px_44px]"
      />
      <HeroCrystalShards />

      {/* Top Navigation */}
      <header className="relative z-10 mx-auto w-full max-w-5xl flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#141010]/90 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-500/40 hover:text-white transition-colors"
        >
          <RageLogo variant="red" className="h-4 w-4" />
          <span>Back to Rage AI</span>
        </Link>

        <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/[0.08] px-3 py-1 text-[11px] text-red-200">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Minimal OAuth • BYOK Ready
        </span>
      </header>

      {/* Main Split Container */}
      <main className="relative z-10 mx-auto w-full max-w-5xl py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Pitch + Live Prompt Preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 space-y-6 text-center lg:text-left"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workspace Agent</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.06]">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent">
                Rage AI
              </span>
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto lg:mx-0">
              Sign in with basic Google profile only, paste your{" "}
              <span className="text-red-400">free-tier Gemini or NVIDIA NIM</span> key, and turn
              natural language into completed workspace actions.
            </p>
          </div>

          {/* Supported Stack Icons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            {STACK_ICONS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.name}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#141010]/90 px-3 py-1.5 text-[11px] text-zinc-300"
                >
                  <Icon className="h-3.5 w-3.5 text-red-400" />
                  <span>{item.name}</span>
                </div>
              )
            })}
          </div>

          {/* Interactive Prompt Carousel */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#120e0e]/90 p-4 text-left space-y-3 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-400">
                <Terminal className="h-3.5 w-3.5" />
                <span>Try asking &bull; {activePrompt.tag}</span>
              </div>
              <div className="flex items-center gap-1">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={p.tag}
                    type="button"
                    aria-label={`Preview ${p.tag}`}
                    onClick={() => setActivePromptIdx(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === activePromptIdx ? "w-5 bg-red-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs italic text-zinc-200 leading-relaxed min-h-[36px]">
              &ldquo;{activePrompt.text}&rdquo;
            </p>
          </div>
        </motion.div>

        {/* Right Crimson-Rimmed Sign-In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="lg:col-span-6 flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-md rounded-3xl p-px bg-gradient-to-b from-red-500/45 via-white/10 to-white/[0.04] shadow-[0_25px_70px_rgba(220,38,38,0.2)]">
            <div className="rounded-[23px] bg-[#130f0f]/95 backdrop-blur-xl p-7 sm:p-9 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
                  <RageLogo variant="red" className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0b0909] px-3 py-1 text-[11px] text-zinc-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
                  No upfront app scopes
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Get started</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Authenticate once with Google, then add your API keys or webhooks locally in your browser.
                </p>
              </div>

              {errorBannerText && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/35 bg-red-500/10 px-3.5 py-3 text-xs text-red-200 leading-relaxed">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorBannerText}</span>
                </div>
              )}

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isRedirecting || oauthConfigured === false}
                className="w-full group relative rounded-full p-px bg-gradient-to-r from-red-500/60 via-white/20 to-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.38)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3 rounded-full bg-[#0d0a0a] group-hover:bg-[#140e0e] py-3.5 px-6 text-sm font-semibold text-white transition-colors">
                  {isRedirecting ? (
                    <Loader2 className="h-5 w-5 animate-spin text-red-400" />
                  ) : (
                    <GoogleColorIcon className="h-5 w-5 shrink-0" />
                  )}
                  <span>{isRedirecting ? "Connecting to Google..." : "Continue with Google"}</span>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Trust Highlights */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0d0a0a] px-3 py-2">
                  <Check className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>Free-tier Gemini &amp; NIM</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0d0a0a] px-3 py-2">
                  <KeyRound className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>Browser-only keys</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 text-center leading-relaxed pt-1">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-red-400 hover:text-red-300 underline underline-offset-4">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-red-400 hover:text-red-300 underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Subtle Bottom Strip */}
      <footer className="relative z-10 mx-auto w-full max-w-5xl flex items-center justify-between text-[11px] text-zinc-500 pt-4">
        <span>&copy; {new Date().getFullYear()} Rage AI</span>
        <span>Sign-in scopes: openid, email, profile</span>
      </footer>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0909] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
