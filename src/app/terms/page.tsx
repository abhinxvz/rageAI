import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Terms of Service - Rage AI',
    description: 'Terms of Service for Rage AI - Your AI-powered personal assistant',
}

export default function TermsOfServicePage() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="min-h-screen bg-[#0b0909] text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-6">
                    <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                        &larr; Back to Rage AI
                    </Link>
                </div>
                <div className="bg-[#120e0e] border border-white/10 rounded-2xl shadow-xl">
                    <div className="p-8 space-y-8">
                        <div className="text-center space-y-3">
                            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
                            <div className="text-sm text-zinc-400 space-y-1">
                                <p><strong>Effective Date:</strong> {currentDate}</p>
                                <p><strong>Last Updated:</strong> {currentDate}</p>
                            </div>
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-sm text-zinc-200">
                                    <strong>Personal Open-Source Project:</strong> Rage AI is provided as-is for personal productivity and experimentation.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing or using Rage AI (&ldquo;the Service&rdquo;), you agree to these Terms of Service and our{' '}
                                    <Link href="/privacy" className="text-red-400 hover:underline">Privacy Policy</Link>.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">2. Scope of Service</h2>
                                <p>
                                    Rage AI connects your chosen AI model API key (Google Gemini, OpenAI, or NVIDIA Nemotron) with limited,
                                    explicitly authorized workspace tools (Gmail, Google Calendar, Google Docs, and Web Search).
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">3. User Responsibility &amp; API Keys</h2>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>You supply and remain responsible for your own AI API keys and provider usage limits.</li>
                                    <li>Always review AI-proposed actions (sending emails, modifying calendar events, sharing documents) before confirming.</li>
                                    <li>Do not use the Service for spam, abuse, unauthorized access, or unlawful activity.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">4. Disclaimer</h2>
                                <p>
                                    The Service is provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; without warranties of any kind.
                                    Contact <a href="mailto:abhinxv18@gmail.com" className="text-red-400 hover:underline">abhinxv18@gmail.com</a> with any questions.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
