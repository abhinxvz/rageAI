import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Privacy Policy - Rage AI',
    description: 'Privacy Policy for Rage AI - Your AI-powered personal assistant',
}

export default function PrivacyPolicyPage() {
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
                            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
                            <div className="text-sm text-zinc-400 space-y-1">
                                <p><strong>Effective Date:</strong> {currentDate}</p>
                                <p><strong>Last Updated:</strong> {currentDate}</p>
                            </div>
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-sm text-zinc-200">
                                    <strong>Open Source Project:</strong> Rage AI is an open-source personal AI assistant
                                    focused on minimal permissions and user-owned API keys.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
                                <p>
                                    Rage AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the project&rdquo;) provides an AI-powered workspace assistant.
                                    This Privacy Policy explains what minimal data we process when you sign in and optionally connect Google services.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Basic Google profile details (name, email address, avatar) used only for authentication.</li>
                                    <li>Chat messages and conversation threads stored so you can revisit past sessions.</li>
                                    <li>AI provider API keys (Gemini, OpenAI, NVIDIA Nemotron) are stored locally in your browser&apos;s localStorage and sent only with your chat requests to the provider you select.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">3. Optional Google App Connections</h2>
                                <p>
                                    Signing in only requests basic profile info (<code>openid</code>, <code>email</code>, <code>profile</code>).
                                    You can optionally connect limited Google resources from the sidebar at any time:
                                </p>
                                <div className="grid gap-3 md:grid-cols-3 pt-2">
                                    {[
                                        { name: 'Gmail', desc: 'Search, read, draft, and send emails when requested.' },
                                        { name: 'Google Calendar', desc: 'View, create, update, and remove calendar events.' },
                                        { name: 'Google Docs', desc: 'Create, read, edit, and manage documents created with Rage AI.' },
                                    ].map((service) => (
                                        <div key={service.name} className="p-4 bg-white/[0.03] rounded-xl border border-white/10">
                                            <h3 className="font-semibold text-white mb-1">{service.name}</h3>
                                            <p className="text-xs text-zinc-400">{service.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">4. Google API Services User Data Policy</h2>
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p>
                                        Rage AI&apos;s use and transfer of information received from Google APIs adheres to the{' '}
                                        <a
                                            href="https://developers.google.com/terms/api-services-user-data-policy"
                                            className="text-red-400 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Google API Services User Data Policy
                                        </a>, including the Limited Use requirements. We never sell user data or use it for advertising.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-semibold text-white">5. Your Controls &amp; Contact</h2>
                                <p>
                                    You can disconnect any connected Google service from the chat sidebar or revoke access anytime in your Google Account settings.
                                    Questions? Email <a href="mailto:abhinxv18@gmail.com" className="text-red-400 hover:underline">abhinxv18@gmail.com</a>.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
