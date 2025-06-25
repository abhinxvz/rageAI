"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, AppWindowIcon, SmileIcon, LeafyGreenIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TextHoverEffectDemo } from "@/components/text-hover-effect-demo"
import { CardSpotlight } from "@/components/ui/card-spotlight"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link className="flex items-center space-x-2 font-bold" href="/">
            <img src="/logo.png" alt="Rage AI Logo" className="h-8 w-8" />
            <div className="flex flex-col">
              <span>Rage AI</span>
              <span className="text-xs text-gray-400 font-normal">Your One Way solution for every task</span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="hidden text-sm text-green-400 sm:block">Coming Soon</span>
            <Button className="bg-gradient-to-r from-green-400 to-emerald-500 text-black hover:from-green-500 hover:to-emerald-600">
              JOIN WAIT LIST
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Curved Lines */}
          <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Top Curves */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                repeatDelay: 1,
              }}
              d="M 100 100 Q 300 0 500 100 T 900 100"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="1"
            />
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                repeatDelay: 1,
                delay: 0.5,
              }}
              d="M 0 200 Q 200 100 400 200 T 800 200"
              fill="none"
              stroke="url(#grad2)"
              strokeWidth="1"
            />
            {/* Bottom Curves */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                repeatDelay: 1,
                delay: 1,
              }}
              d="M 100 600 Q 300 500 500 600 T 900 600"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="1"
            />
          </svg>

          {/* Straight Lines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: "100%", opacity: 0 }}
                animate={{
                  x: "-100%",
                  opacity: [0, 0.7, 0.7, 0],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "linear",
                }}
                className="absolute right-0"
                style={{
                  top: `${15 + i * 10}%`,
                  height: "1px",
                  width: "100%",
                  background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? "#22d3ee" : "#8b5cf6"}60, transparent)`,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 z-[1]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute -right-1/4 top-1/2 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="container relative z-[3] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mx-auto max-w-3xl space-y-8"
          >
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-5xl lg:text-7xl">
              Meet Rage AI: Your Smartest Teammate
            </h1>
            <p className="mx-auto max-w-2xl text-muted text-gray-400 sm:text-xl">
              Just tell Rage AI what you need in plain English, and it gets it done. From drafting emails to updating
              spreadsheets, Rage AI talks to all your apps and takes care of the busywork for you.
            </p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-gradient-to-r from-green-400 to-emerald-500 text-lg text-black hover:from-green-500 hover:to-emerald-600">
                JOIN WAIT LIST
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 border-t border-white/10 bg-black py-24">
        <div className="container px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Rage AI?</h2>
            <p className="mt-4 text-gray-400">Experience work automation that actually works for you</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-green-400/50"
            >
              <AppWindowIcon className="mb-4 h-12 w-12 text-green-400" />
              <h3 className="mb-2 text-xl font-bold">App Integration</h3>
              <p className="text-gray-400">
                Connects with Gmail, Slack, Notion, and more. No more tab switching or context switching.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-emerald-400/50"
            >
              <SmileIcon className="mb-4 h-12 w-12 text-emerald-400" />
              <h3 className="mb-2 text-xl font-bold">Plain English Commands</h3>
              <p className="text-gray-400">
                Just chat like you're talking to a teammate. Rage AI figures out what apps to use and what steps to
                take.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-green-400/50"
            >
              <LeafyGreenIcon className="mb-4 h-12 w-12 text-green-400" />
              <h3 className="mb-2 text-xl font-bold">Friction-Free Work</h3>
              <p className="text-gray-400">
                Less about building workflows, more about removing friction. A single space where things just get done.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 border-t border-white/10 bg-black py-24">
        <div className="container px-4">
          <div className="flex justify-center">
            <CardSpotlight className="group h-auto w-full max-w-5xl p-8">
              <div className="relative z-20 flex flex-col items-start">
                <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">
                  Ready to Meet Your New Teammate?
                </h2>
                <p className="mt-4 text-lg text-neutral-200">Let's Build the Future of AI Together</p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                    <span className="text-base text-white">No setup required - just start talking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                    <span className="text-base text-white">Works with your existing apps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                    <span className="text-base text-white">Early access to new features</span>
                  </li>
                </ul>
                <div className="mt-8 self-center">
                  <Button className="bg-gradient-to-r from-green-400 to-emerald-500 text-lg text-black hover:from-green-500 hover:to-emerald-600">
                    JOIN WAIT LIST
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardSpotlight>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 border-t border-white/10 bg-black py-24">
        <div className="container px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-gray-400">Everything you need to know about Rage AI</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-3 text-xl font-bold text-green-400">What is Rage AI?</h3>
              <p className="text-gray-400">
                Rage AI is your smartest teammate. You just tell it what you need in plain English, and it gets it done.
                Whether it's drafting an email, pulling info from Notion, summarizing a doc, scheduling something on
                your calendar, or updating a spreadsheet, Rage AI talks to all your apps and takes care of the busywork
                for you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-3 text-xl font-bold text-green-400">How does Rage AI work?</h3>
              <p className="text-gray-400">
                Like you're chatting with a teammate. It figures out what apps to use, what steps to take, and does the
                work for you. Whether it's pulling info from your inbox, updating a Notion doc, or creating a chart,
                Rage AI handles it all seamlessly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-3 text-xl font-bold text-green-400">What makes Rage AI different?</h3>
              <p className="text-gray-400">
                It's about changing how you interact with your work. Instead of jumping between tools or relying on
                rigid setups, Rage AI becomes a single space where things just get done. It's less about building
                workflows, and more about removing friction. No more tab switching, no more context switching - just
                talk to Rage AI and move on.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-3 text-xl font-bold text-green-400">Which apps does Rage AI integrate with?</h3>
              <p className="text-gray-400">
                Rage AI works with Gmail, Slack, Notion, Google Calendar, spreadsheet applications, and many more. The
                integration list is constantly growing to support your entire workflow ecosystem.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Text Hover Effect Section */}
      <section className="relative z-10 border-t border-white/10 bg-black">
        <TextHoverEffectDemo />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-8">
        <div className="container flex flex-col items-center justify-between space-y-4 px-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Rage AI Logo" className="h-6 w-6" />
            <span className="font-bold">Rage AI</span>
          </div>
          <p className="text-sm text-gray-400 font-sans font-bold text-center">
            © {new Date().getFullYear()} Rage AI. Made by Abhinav.
          </p>
          <div className="flex space-x-6">
            <Link className="text-sm text-gray-400 hover:text-cyan-400" href="#"></Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
