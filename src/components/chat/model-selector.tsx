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
                    className="bg-zinc-900 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-950 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Select model"
                    disabled={disabled}
                >
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(239,68,68,0.6)_0%,rgba(239,68,68,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </span>
                    <div className="relative flex items-center gap-2 z-10 rounded-full bg-[#0e0b0b] py-1.5 px-3 ring-1 ring-white/10">
                        <span className="truncate max-w-[160px]">{currentModelName}</span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                    </div>
                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-red-500/0 via-red-500/90 to-red-500/0 transition-opacity duration-500 group-hover:opacity-40" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-[#141010] border-white/10 text-white">
                {models.map((m) => (
                    <DropdownMenuItem
                        key={m.id}
                        onClick={() => !m.disabled && onChange(m.id)}
                        disabled={m.disabled}
                        className={m.disabled ? "opacity-45 cursor-not-allowed" : "focus:bg-red-500/15 focus:text-white cursor-pointer"}
                    >
                        <div className="flex items-center justify-between w-full gap-2">
                            <span className="truncate">{m.name}</span>
                            {m.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/20 shrink-0">
                                    {m.badge}
                                </span>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}