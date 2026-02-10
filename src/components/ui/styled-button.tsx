import React from "react"
import { cn } from "@/lib/utils"

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

export const StyledButton = React.forwardRef<HTMLButtonElement, StyledButtonProps>(
  ({ children, variant = "default", size = "default", className, asChild, ...props }, ref) => {
    const sizeClasses = {
      default: "py-2 px-6 text-sm",
      sm: "py-0.5 px-4 text-xs",
      lg: "py-3 px-8 text-base",
      icon: "p-2 w-8 h-8"
    }

    if (variant === "ghost" || variant === "outline") {
      return (
        <button
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            variant === "outline" && "border border-input bg-background",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <button
        ref={ref}
        className={cn(
          "bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px font-semibold leading-6 text-white inline-block",
          className
        )}
        {...props}
      >
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </span>
        <div className={cn(
          "relative flex space-x-2 items-center justify-center z-10 rounded-full bg-zinc-950 ring-1 ring-white/10",
          sizeClasses[size]
        )}>
          {children}
        </div>
        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
      </button>
    )
  }
)

StyledButton.displayName = "StyledButton"
