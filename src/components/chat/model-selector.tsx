import { getModelsForKeys } from "@/lib/models";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function ModelSelector({ model, onChange, keys, disabled }: { model: string; onChange: (m: string) => void; keys: any, disabled: boolean }) {
    const models = getModelsForKeys(keys)
    const currentModelName = models.find(m => m.id === model)?.name || model

    return (
        <DropdownMenu>
            <DropdownMenuTrigger disabled={disabled} asChild>
                <button
                    className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Select model"
                    disabled={disabled}
                >
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(16,114,248,0.6)_0%,rgba(16,114,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </span>
                    <div className="relative flex items-center gap-2 z-10 rounded-full bg-zinc-950 py-1.5 px-3 ring-1 ring-white/10">
                        <span className="truncate">{currentModelName}</span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                    </div>
                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
                {models.map((m) => (
                    <DropdownMenuItem
                        key={m.id}
                        onClick={() => !m.disabled && onChange(m.id)}
                        disabled={m.disabled}
                        className={m.disabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        <div className="flex items-center justify-between w-full">
                            <span>{m.name}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}