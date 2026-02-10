import { cn } from "@/lib/utils"

export function PillButton({
    active,
    onClick,
    icon: Icon,
    label,
    disabled
}: {
    active?: boolean
    onClick?: () => void
    icon: React.ComponentType<{ className?: string }>
    label: string
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={!!active}
            disabled={disabled}
            className={cn(
                "bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className={cn(
                    "absolute inset-0 rounded-full transition-opacity duration-500",
                    active 
                        ? "bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(16,114,248,0.6)_0%,rgba(16,114,248,0)_75%)] opacity-100"
                        : "bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(16,114,248,0.6)_0%,rgba(16,114,248,0)_75%)] opacity-0 group-hover:opacity-100"
                )} />
            </span>
            <div className={cn(
                "relative flex items-center gap-2 z-10 rounded-full bg-zinc-950 py-1.5 px-3 ring-1",
                active ? "ring-[#1072f8]/50" : "ring-white/10"
            )}>
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
            </div>
            <span className={cn(
                "absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500",
                active ? "opacity-40" : "group-hover:opacity-40"
            )} />
        </button>
    )
}