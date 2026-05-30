"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function SignIn() {
  const router = useRouter()

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/chat")
      }
    })
  }, [router])

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/chat" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <button
            className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
            onClick={() => window.location.href = "mailto:abhinxv18@gmail.com"}
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="font-montserrat">Contact Us</span>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
          </button>
        </div>

        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-white font-montserrat">Rage <span className="bg-gradient-to-r from-[#1072f8] to-[#0052cc] bg-clip-text text-transparent">AI</span></h1>
            <p className="text-lg text-gray-400 max-w-sm mx-auto font-montserrat">
              Your intelligent workspace assistant
            </p>
          </div>
        </div>

        <Card className="border border-white/10 shadow-xl bg-zinc-950/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 space-y-2">
            <CardTitle className="text-xl font-semibold text-white font-montserrat">Get Started</CardTitle>
            <CardDescription className="text-base text-gray-400 font-montserrat">Connect with Google to unlock your AI assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <button
              onClick={handleSignIn}
              className="w-full bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center justify-center z-10 rounded-full bg-zinc-950 py-3 px-6 ring-1 ring-white/10">
                <Image
                  src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png'
                  width={24}
                  height={24}
                  alt="Google Logo"
                />
                <span className="font-montserrat">Continue with Google</span>
                <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.75 8.75L14.25 12L10.75 15.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400 font-montserrat">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Private</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Free</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center leading-relaxed px-4 font-montserrat">
                By continuing, you agree to our Terms of Service and Privacy Policy. Your data stays secure and private.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-white font-montserrat">Try saying:</p>
          <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-sm italic text-[#1072f8] font-montserrat">
            &quot;Hey Rage, schedule a meeting with John tomorrow at 3 PM and send him the invite&quot;
          </div>
        </div>
      </div>
    </div>
  )
}

