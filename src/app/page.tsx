"use client"

import { motion } from "framer-motion"
import { CheckCircle2, AppWindowIcon, SmileIcon, LeafyGreenIcon, ChevronDown } from "lucide-react"
import Link from "next/link"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { SparklesCore } from "@/components/ui/sparkles"
import { TextHoverEffect } from "@/components/ui/text-hover-effect"
import { useState } from "react"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "What is Rage AI?",
      answer: "Rage AI is your smartest teammate. You just tell it what you need in plain English, and it gets it done. Whether it&apos;s drafting an email in Gmail, creating GitHub repos with files and issues, updating a Notion database, or scheduling something on Google Calendar, Rage AI connects to your tools and takes care of the busywork for you."
    },
    {
      question: "How does Rage AI work?",
      answer: "Like you&apos;re chatting with a teammate. It figures out what to do and handles your apps automatically. Whether it&apos;s pulling info from Gmail, creating GitHub PRs and managing code files, updating a Notion page, or scheduling in Calendar, Rage AI handles it all seamlessly."
    },
    {
      question: "What makes Rage AI different?",
      answer: "It&apos;s about changing how you interact with your work. Instead of jumping between Gmail, Calendar, Docs, GitHub, and Notion or relying on rigid setups, Rage AI becomes a single space where things just get done. It&apos;s less about building workflows, and more about removing friction."
    },
    {
      question: "Which apps does Rage AI integrate with?",
      answer: "Rage AI works with Gmail, Google Calendar, Google Docs, GitHub, and Notion. Manage your emails, schedule meetings, create documents, handle complete GitHub workflows (repos, files, branches, issues, PRs, code reviews), and organize your Notion workspace - all through natural conversation."
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Image with 20% opacity */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-27"
        style={{ backgroundImage: "url('/bg-image.jpg')" }}
      />

      {/* Content wrapper */}
      <div className="relative z-10">

        {/* Navigation */}
        <header className="fixed top-0 z-50 w-full bg-transparent">
          <div className="container flex h-20 items-center justify-between px-6">
            <Link className="flex items-center space-x-2" href="/">
              <img src="/logo.png" alt="Rage AI Logo" className="h-10 w-10" />
              <span className="font-['TRTCENZO'] text-2xl text-white">Rage AI</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors font-montserrat">Features</a>
              <a href="#faq" className="text-sm text-gray-300 hover:text-white transition-colors font-montserrat">FAQs</a>
              <Link href="/auth/signin">
                <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </span>
                  <div className="relative flex items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                    <span className="font-montserrat">Get Started</span>
                  </div>
                  <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
                </button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
          <div className="container relative z-[3] px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mx-auto max-w-3xl space-y-8"
            >
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-5xl lg:text-7xl font-montserrat leading-tight sm:leading-tight md:leading-tight lg:leading-[1.15]">
                <span className="relative inline-block">
                  <span className="text-white">
                    Meet <span className="bg-gradient-to-r from-[#1072f8] to-[#0052cc] bg-clip-text text-transparent">Rage AI</span>: Your Smartest Teammate
                  </span>
                  <span className="absolute inset-0 pointer-events-none">
                    <SparklesCore
                      className="w-full h-full"
                      particleColor="#fff"
                      particleDensity={40}
                      minSize={1}
                      maxSize={2}
                      speed={2}
                      background="transparent"
                    />
                  </span>
                </span>
              </h1>
              <div className="flex justify-center space-x-4">
                <Link href="/auth/signin">
                  <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block">
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                      <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </span>
                    <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-2 px-6 ring-1 ring-white/10">
                      <span className="font-montserrat">Get Started</span>
                      <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.75 8.75L14.25 12L10.75 15.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 bg-transparent py-24">
          <div className="container px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-montserrat">
                Why Choose <span className="bg-gradient-to-r from-[#1072f8] to-[#0052cc] bg-clip-text text-transparent">Rage AI</span>?
              </h2>
              <p className="mt-4 text-gray-400 font-montserrat">Experience work automation that actually works for you</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <CardSpotlight className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-[#1072f8]/50 h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative z-10"
                >
                  <AppWindowIcon className="mb-4 h-12 w-12 text-[#1072f8]" />
                  <h3 className="mb-2 text-xl font-bold font-montserrat">Powerful Integrations</h3>
                  <p className="text-gray-400 font-montserrat">
                    Seamlessly connects with Gmail, Google Calendar, Google Docs, GitHub, and Notion. No more tab switching or context switching.
                  </p>
                </motion.div>
              </CardSpotlight>
              <CardSpotlight className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-[#1072f8]/50 h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="relative z-10"
                >
                  <SmileIcon className="mb-4 h-12 w-12 text-[#1072f8]" />
                  <h3 className="mb-2 text-xl font-bold font-montserrat">Plain English Commands</h3>
                  <p className="text-gray-400 font-montserrat">
                    Just chat like you&apos;re talking to a teammate. Rage AI figures out what to do and handles your Google apps automatically.
                  </p>
                </motion.div>
              </CardSpotlight>
              <CardSpotlight className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-[#1072f8]/50 h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="relative z-10"
                >
                  <LeafyGreenIcon className="mb-4 h-12 w-12 text-[#1072f8]" />
                  <h3 className="mb-2 text-xl font-bold font-montserrat">Friction-Free Work</h3>
                  <p className="text-gray-400 font-montserrat">
                    Less about building workflows, more about removing friction. A single space where your Google workspace just works.
                  </p>
                </motion.div>
              </CardSpotlight>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 bg-transparent py-24">
          <div className="container px-4">
            <div className="flex justify-center">
              <CardSpotlight className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-[#1072f8]/50 h-auto w-full max-w-5xl">
                <div className="relative z-20 flex flex-col items-start">
                  <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl font-montserrat">
                    Ready to Meet Your <span className="bg-gradient-to-r from-[#1072f8] to-[#0052cc] bg-clip-text text-transparent">New Teammate</span>?
                  </h2>
                  <p className="mt-4 text-lg text-neutral-200 font-montserrat">Let&apos;s Build the Future of AI Together</p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1072f8]" />
                      <span className="text-base text-white font-montserrat">No setup required - just start talking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1072f8]" />
                      <span className="text-base text-white font-montserrat">Works with your Google Workspace</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1072f8]" />
                      <span className="text-base text-white font-montserrat">Early access to new features</span>
                    </li>
                  </ul>
                  <div className="mt-8 self-center">
                    <Link href="/auth/signin">
                      <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block">
                        <span className="absolute inset-0 overflow-hidden rounded-full">
                          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        </span>
                        <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-2 px-6 ring-1 ring-white/10">
                          <span className="font-montserrat">Get Started</span>
                          <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.75 8.75L14.25 12L10.75 15.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
                      </button>
                    </Link>
                  </div>
                </div>
              </CardSpotlight>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative z-10 bg-transparent py-24">
          <div className="container px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-montserrat">Frequently Asked Questions</h2>
              <p className="mt-4 text-gray-400 font-montserrat">Everything you need to know about Rage AI</p>
            </div>
            <div className="mx-auto max-w-3xl space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white font-montserrat flex-1 pr-4 leading-snug">
                      {faq.question.includes('Rage AI') ? (
                        <>
                          {faq.question.split('Rage AI')[0]}
                          <span className="bg-gradient-to-r from-[#1072f8] to-[#0052cc] bg-clip-text text-transparent">Rage AI</span>
                          {faq.question.split('Rage AI')[1]}
                        </>
                      ) : (
                        faq.question
                      )}
                    </h3>
                    <ChevronDown
                      className={`h-5 w-5 text-[#1072f8] transition-transform duration-300 flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? 'auto' : 0,
                      opacity: openFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4">
                      <p className="text-gray-300 font-montserrat text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Text Hover Effect Section */}
        <section className="relative z-10 bg-gradient-to-b from-transparent via-[#1072f8]/10 to-transparent py-24">
          <div className="h-[20rem] flex items-center justify-center">
            <TextHoverEffect text="RAGE AI" />
          </div>
        </section>

        {/* Footer */}
        <footer className="relative bg-[#0a0a0a] py-16 border-t border-blue-500/50">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a] to-[#0a0a0a]" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
              {/* Brand Section - Takes more space */}
              <div className="md:col-span-5">
                <div className="flex items-center space-x-2 mb-4">
                  <img src="/logo.png" alt="Rage AI Logo" className="h-6 w-6" />
                  <span className="font-['TRTCENZO'] text-xl">Rage AI</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                  Your autonomous AI teammate that just gets things done. Tell it what you need, and it handles the rest - no hand-holding required. Works seamlessly with Gmail, GitHub, Notion, Calendar, and more.
                </p>
              </div>

              {/* Support Section */}
              <div className="md:col-span-3 md:col-start-7">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  SUPPORT
                </h3>
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/terms"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Terms of Use
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="mailto:contact@rageai.com"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* Social Section */}
              <div className="md:col-span-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  SOCIAL
                </h3>
                <div className="flex space-x-4">
                  <Link
                    href="https://x.com/rag3AI"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </Link>
                  <Link
                    href="https://github.com/abhinxvz/rageAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-500 mb-4 md:mb-0">
                © {new Date().getFullYear()} Rage AI. All rights reserved.
              </p>
              <Link
                href="https://github.com/abhinxvz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                Made by @abhinxvz
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

