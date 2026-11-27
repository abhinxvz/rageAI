import React from "react"
import { cn } from "@/lib/utils"

interface RageLogoProps {
  className?: string
  variant?: "red" | "white"
}

export function RageLogo({ className, variant = "red" }: RageLogoProps) {
  const id = React.useId()

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8", className)}
      aria-label="Rage AI Logo"
    >
      {variant === "red" && (
        <defs>
          <linearGradient id={id} x1="15" y1="12" x2="85" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff5757" />
            <stop offset="55%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M22 16H60C76 16 86 25.5 86 39C86 52.5 76 62 60 62H22V48H58.5C67 48 72 44.5 72 39C72 33.5 67 30 58.5 30H22V16Z"
        fill={variant === "white" ? "currentColor" : `url(#${id})`}
      />
      <path
        d="M42 58L22 86H39L52 67.5L65 86H82L62 58H42Z"
        fill={variant === "white" ? "currentColor" : `url(#${id})`}
      />
    </svg>
  )
}
