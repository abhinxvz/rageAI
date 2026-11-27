"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react"
import { Suspense } from "react"
import { RageLogo } from "@/components/rage-logo"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorDetails = () => {
    switch (error) {
      case 'OAuthSignin':
        return {
          title: 'OAuth Sign-In Failed',
          description: 'Could not initialize Google sign-in.',
          message:
            'Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in your .env file and restart the server.',
        }
      case 'OAuthCallback':
        return {
          title: 'OAuth Callback Error',
          description: 'Google returned an error or callback validation failed.',
          message:
            'Verify your Google OAuth Authorized Redirect URI (/api/auth/callback/google) and ensure DATABASE_URL is reachable.',
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'Google sign-in permission was declined.',
          message: 'Please retry signing in with Google to continue to Rage AI.',
        }
      case 'Configuration':
        return {
          title: 'Configuration Error',
          description: 'Missing required authentication environment variables.',
          message:
            'Check NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in your .env file.',
        }
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred during authentication.',
          message: 'Please try signing in again or check your server logs for details.',
        }
    }
  }

  const errorDetails = getErrorDetails()

  return (
    <div className="min-h-screen bg-[#0b0909] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[440px] bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(220,38,38,0.2),transparent_100%)]"
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-red-500/25 bg-[#130f0f]/95 p-8 space-y-6 shadow-2xl shadow-red-950/30">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <RageLogo variant="red" className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold text-white">{errorDetails.title}</h1>
          <p className="text-xs text-red-300">{errorDetails.description}</p>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed rounded-xl border border-white/[0.07] bg-[#0b0909] p-4">
          {errorDetails.message}
        </p>

        <Link
          href="/auth/signin"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f5f5f5] px-5 py-2.5 text-xs font-semibold text-[#0b0909] hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0909] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
