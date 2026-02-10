"use client"
import { useRef, useState, MouseEvent } from "react"

export const TextHoverEffect = ({
  text,
  duration,
}: {
  text: string
  duration?: number
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect()
      // Convert mouse position to SVG coordinates
      const x = ((e.clientX - svgRect.left) / svgRect.width) * 300
      const y = ((e.clientY - svgRect.top) / svgRect.height) * 100
      setCursor({ x, y })
    }
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className="select-none"
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1072f8" />
          <stop offset="50%" stopColor="#3b8fff" />
          <stop offset="100%" stopColor="#1072f8" />
        </linearGradient>

        <radialGradient id="revealGradient">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="40%" stopColor="white" stopOpacity="0.8" />
          <stop offset="70%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="black" />
          {hovered && (
            <circle
              cx={cursor.x}
              cy={cursor.y}
              r="50"
              fill="url(#revealGradient)"
            />
          )}
        </mask>

        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Base faded outline text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        stroke="#374151"
        fill="none"
        className="font-[helvetica] font-bold text-7xl"
        style={{ opacity: 0.3 }}
      >
        {text}
      </text>

      {/* Glowing hover text with gradient */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        stroke="url(#blueGradient)"
        fill="none"
        className="font-[helvetica] font-bold text-7xl"
        mask="url(#textMask)"
        filter="url(#glow)"
      >
        {text}
      </text>
    </svg>
  )
}
