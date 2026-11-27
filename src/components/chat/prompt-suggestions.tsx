import React from 'react';
import { Sun, Youtube, Github, Briefcase } from 'lucide-react';
import Image from 'next/image';

const PromptSuggestions = ({ onSuggestionClick }: { onSuggestionClick: (content: string) => void }) => {
    const SUGGESTIONS = [
        {
            text: "Scrape best jobs for my resume, draft Gmail outreach, save to Docs & alert Discord",
            icon: Briefcase,
        },
        {
            text: "Give me my Morning Briefing from Calendar, Gmail & news",
            icon: Sun,
        },
        {
            text: "Summarize a YouTube video and turn key takeaways into notes",
            icon: Youtube,
        },
        {
            text: "Inspect vercel/next.js latest releases and open issues",
            icon: Github,
        },
    ];

    return (
        <div className="w-full flex flex-col items-center justify-center gap-6 mb-40">
            <div className="w-full flex items-center justify-center flex-col gap-2">
                <Image src="/logo.png" alt="Rage AI" width={140} height={140} />
                <div className="text-zinc-400 text-sm text-center">
                    Ask Rage AI anything — paste URLs, YouTube links, GitHub repos, or automate Google Workspace
                </div>
            </div>
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTIONS.map((suggestion, index) => {
                    const IconComponent = suggestion.icon;
                    return (
                        <div
                            key={index}
                            onClick={() => onSuggestionClick(suggestion.text)}
                            className="group bg-[#141010] hover:bg-[#191313] border border-white/[0.07]
                         px-4 py-4 rounded-xl cursor-pointer
                         transition-all duration-200
                         hover:shadow-lg hover:border-red-500/35"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 p-2 bg-red-500/15 rounded-lg group-hover:bg-red-500/25 transition-colors">
                                    <IconComponent className="w-4 h-4 text-red-400" />
                                </div>
                                <p className="text-zinc-200 group-hover:text-white font-medium text-sm">
                                    {suggestion.text}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PromptSuggestions;
