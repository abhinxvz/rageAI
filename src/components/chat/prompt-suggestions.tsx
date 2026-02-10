import React from 'react';
import { Mail, Calendar, Users, Send } from 'lucide-react';
import Image from 'next/image';
const PromptSuggestions = ({ onSuggestionClick }: { onSuggestionClick: (content: string) => void }) => {

    const SUGGESTIONS = [
        {
            text: "Summarize my recent emails",
            icon: Mail
        },
        {
            text: "What's on my schedule today?",
            icon: Calendar
        },
        {
            text: "Schedule a team meeting",
            icon: Users
        },
        {
            text: "Draft an email invitation",
            icon: Send
        }
    ];

    return (
        <div className="w-full flex flex-col items-center justify-center gap-6 mb-40">
            <div className='w-full flex items-center justify-center flex-col gap-2' >
                <Image src="/logo.png" alt="Rage AI" width={180} height={180} />
                <div className="text-gray-400 text-sm">You can ask Rage to do anything you want</div>
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
                {SUGGESTIONS?.map((suggestion, index) => {
                    const IconComponent = suggestion.icon;
                    return (
                        <div
                            key={index}
                            onClick={() => onSuggestionClick(suggestion.text)}
                            className="group bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 border border-white/5 
                         px-4 py-4 rounded-lg cursor-pointer 
                         transition-all duration-200 
                         hover:shadow-lg hover:border-[#1072f8]/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 p-2 bg-[#1072f8]/10 rounded-lg group-hover:bg-[#1072f8]/20 transition-colors">
                                    <IconComponent className="w-4 h-4 text-[#3b8fff]" />
                                </div>
                                <p className="text-gray-200 group-hover:text-white font-medium text-sm">
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