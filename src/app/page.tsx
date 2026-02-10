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
      answer: "Rage AI is your smartest teammate. You just tell it what you need in plain English, and it gets it done. Whether it's drafting an email in Gmail, creating GitHub repos with files and issues, updating a Notion database, or scheduling something on Google Calendar, Rage AI connects to your tools and takes care of the busywork for you."
    },
    {
      question: "How does Rage AI work?",
      answer: "Like you're chatting with a teammate. It figures out what to do and handles your apps automatically. Whether it's pulling info from Gmail, creating GitHub PRs and managing code files, updating a Notion page, or scheduling in Calendar, Rage AI handles it all seamlessly."
    },
    {
      question: "What makes Rage AI different?",
      answer: "It's about changing how you interact with your work. Instead of jumping between Gmail, Calendar, Docs, GitHub, and Notion or relying on rigid setups, Rage AI becomes a single space where things just get done. It's less about building workflows, and more about removing friction."
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
                        <path d="M10.75 8.75L14.25 12L10.75 15.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
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
                    Just chat like you're talking to a teammate. Rage AI figures out what to do and handles your Google apps automatically.
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
                  <p className="mt-4 text-lg text-neutral-200 font-montserrat">Let's Build the Future of AI Together</p>
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
                            <path d="M10.75 8.75L14.25 12L10.75 15.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
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
                      className={`h-5 w-5 text-[#1072f8] transition-transform duration-300 flex-shrink-0 ${
                        openFaq === index ? 'rotate-180' : ''
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
      <footer className="bg-transparent py-8">
        <div className="container flex flex-col items-center justify-between space-y-4 px-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Rage AI Logo" className="h-6 w-6" />
            <span className="font-bold font-montserrat">Rage AI</span>
          </div>
          <p className="text-sm text-gray-400 font-montserrat font-bold text-center">
            © {new Date().getFullYear()} Rage AI. Made by Abhinav.
          </p>
          <div className="flex space-x-6">
            <Link
              className="group text-sm text-gray-400 hover:text-[#1072f8] flex items-center gap-1 transition-colors"
              href="https://x.com/rag3AI"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rage AI on X"
            >
              <img
                src="https://bhindi.io/_next/static/media/x.af2a72be.svg"
                alt="X (Twitter) logo"
                width={20}
                height={20}
                className="transition-colors duration-200 text-gray-400 group-hover:text-[#1072f8]"
              />
              @rag3AI
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  ) 
}

