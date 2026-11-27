"use client"

import React from "react"
import { RageLogo } from "@/components/rage-logo"

export function HeroCrystalShards() {
  return (
    <>
      {/* Left faceted crimson glass cluster */}
      <svg
        aria-hidden="true"
        viewBox="0 0 360 360"
        fill="none"
        className="pointer-events-none hidden lg:block absolute -left-24 top-44 h-80 w-80 opacity-90 select-none"
      >
        <defs>
          <linearGradient id="shardL1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5757" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#991b1b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0b0909" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="shardL2" x1="20%" y1="100%" x2="90%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#261313" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0b0909" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="shardGlowL" cx="45%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0b0909" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="195" r="135" fill="url(#shardGlowL)" />
        <polygon
          points="36,248 118,164 202,216 124,302"
          fill="url(#shardL1)"
          stroke="rgba(255,115,115,0.28)"
          strokeWidth="1"
        />
        <polygon
          points="118,164 188,128 242,178 202,216"
          fill="url(#shardL2)"
          stroke="rgba(255,135,135,0.35)"
          strokeWidth="1"
        />
        <polygon
          points="66,118 148,74 176,136 96,174"
          fill="rgba(28,17,17,0.75)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <polygon
          points="164,226 248,200 278,248 194,284"
          fill="url(#shardL2)"
          stroke="rgba(239,68,68,0.42)"
          strokeWidth="1"
        />
      </svg>

      {/* Right faceted crimson glass cluster */}
      <svg
        aria-hidden="true"
        viewBox="0 0 360 360"
        fill="none"
        className="pointer-events-none hidden lg:block absolute -right-24 top-28 h-80 w-80 opacity-90 select-none"
      >
        <defs>
          <linearGradient id="shardR1" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#7f1d1d" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0b0909" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="shardR2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#1b1111" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0b0909" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="shardGlowR" cx="55%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0b0909" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="185" r="135" fill="url(#shardGlowR)" />
        <polygon
          points="126,184 218,136 286,188 194,238"
          fill="url(#shardR1)"
          stroke="rgba(255,120,120,0.4)"
          strokeWidth="1"
        />
        <polygon
          points="198,84 282,48 318,118 232,148"
          fill="rgba(24,15,15,0.72)"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
        />
        <polygon
          points="178,228 266,192 316,246 226,288"
          fill="url(#shardR2)"
          stroke="rgba(248,113,113,0.32)"
          strokeWidth="1"
        />
      </svg>
    </>
  )
}

export function HeroIsometricStack() {
  return (
    <div className="relative h-60 w-60 flex items-center justify-center select-none">
      {/* Ambient crimson glow */}
      <div className="absolute inset-4 rounded-full bg-red-600/25 blur-3xl" />

      {/* Bottom wireframe plate 3 */}
      <div
        className="absolute h-32 w-32 rounded-2xl border border-white/[0.06] bg-[#100c0c]/35"
        style={{ transform: "translateY(52px) rotateX(60deg) rotateZ(-45deg)" }}
      />
      {/* Middle wireframe plate 2 */}
      <div
        className="absolute h-32 w-32 rounded-2xl border border-white/[0.11] bg-[#130e0e]/50"
        style={{ transform: "translateY(32px) rotateX(60deg) rotateZ(-45deg)" }}
      />
      {/* Upper wireframe plate 1 */}
      <div
        className="absolute h-32 w-32 rounded-2xl border border-red-500/25 bg-[#171010]/70"
        style={{ transform: "translateY(12px) rotateX(60deg) rotateZ(-45deg)" }}
      />

      {/* Top primary obsidian plate with glowing crimson-ember rim & hardware notches */}
      <div
        className="relative h-36 w-36 rounded-2xl p-[1.5px] bg-gradient-to-br from-white/25 via-[#ef4444] to-[#ff6b4a] shadow-[0_22px_55px_rgba(220,38,38,0.42)]"
        style={{ transform: "translateY(-14px) rotateX(60deg) rotateZ(-45deg)" }}
      >
        <div className="relative flex h-full w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-[#1d1616] via-[#120d0d] to-[#090707] overflow-hidden">
          {/* Subtle top specular reflection */}
          <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-28 rounded-full bg-white/[0.07] blur-xl" />
          {/* Edge notches */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-4 rounded-b-sm bg-[#0b0909] border-x border-b border-white/10" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-4 rounded-t-sm bg-[#0b0909] border-x border-t border-red-400/35" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-l-sm bg-[#0b0909] border-y border-l border-red-400/35" />
          <RageLogo
            variant="white"
            className="h-14 w-14 text-white drop-shadow-[0_0_16px_rgba(239,68,68,0.65)]"
          />
        </div>
      </div>
    </div>
  )
}

export function WireframeOAuthShield() {
  return (
    <svg viewBox="0 0 220 130" fill="none" className="w-full max-w-[210px] h-auto opacity-70">
      <g stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeLinejoin="round">
        {/* Isometric base card */}
        <polygon points="110,18 194,60 110,104 26,60" fill="rgba(255,255,255,0.015)" />
        <polygon points="26,60 110,104 110,114 26,70" />
        <polygon points="194,60 110,104 110,114 194,70" />
        {/* Inner shield circuit */}
        <polygon points="110,36 154,58 110,84 66,58" stroke="rgba(239,68,68,0.38)" />
        <line x1="88" y1="47" x2="132" y2="71" />
        <line x1="132" y1="47" x2="88" y2="71" />
      </g>
      <circle cx="110" cy="60" r="3" fill="#ef4444" fillOpacity="0.8" />
    </svg>
  )
}

export function WireframeApiKeysChip() {
  return (
    <svg viewBox="0 0 220 130" fill="none" className="w-full max-w-[210px] h-auto opacity-70">
      <g stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeLinejoin="round">
        {/* Isometric keyboard / keycap matrix */}
        <polygon points="110,14 202,60 110,108 18,60" fill="rgba(255,255,255,0.015)" />
        <polygon points="18,60 110,108 110,116 18,68" />
        <polygon points="202,60 110,108 110,116 202,68" />
        {/* Grid lines */}
        <line x1="48" y1="45" x2="140" y2="93" />
        <line x1="78" y1="30" x2="170" y2="78" />
        <line x1="48" y1="75" x2="140" y2="29" />
        <line x1="78" y1="91" x2="170" y2="45" />
        {/* Highlighted keycap */}
        <polygon
          points="110,46 136,59 110,72 84,59"
          stroke="rgba(244,63,94,0.5)"
          fill="rgba(239,68,68,0.08)"
        />
      </g>
    </svg>
  )
}

export function WireframeAgentTerminal() {
  return (
    <svg viewBox="0 0 220 130" fill="none" className="w-full max-w-[210px] h-auto opacity-70">
      <g stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeLinejoin="round">
        {/* Isometric dual pipeline nodes */}
        <polygon points="68,38 110,59 68,80 26,59" fill="rgba(255,255,255,0.015)" />
        <polygon points="152,38 194,59 152,80 110,59" fill="rgba(255,255,255,0.015)" />
        <polygon points="110,66 152,87 110,108 68,87" stroke="rgba(251,146,60,0.42)" />
        {/* Data flow links */}
        <line x1="68" y1="59" x2="110" y2="87" strokeDasharray="3 3" stroke="rgba(239,68,68,0.45)" />
        <line x1="152" y1="59" x2="110" y2="87" strokeDasharray="3 3" stroke="rgba(239,68,68,0.45)" />
        <circle cx="68" cy="59" r="3.5" fill="rgba(255,255,255,0.15)" />
        <circle cx="152" cy="59" r="3.5" fill="rgba(255,255,255,0.15)" />
      </g>
    </svg>
  )
}

export function InteroperableStackDiagram() {
  return (
    <div className="relative mx-auto mt-10 mb-14 flex flex-col items-center justify-center select-none">
      {/* Glow behind floating plates */}
      <div className="pointer-events-none absolute top-4 h-40 w-40 rounded-full bg-red-600/20 blur-3xl" />

      <div className="relative flex flex-col items-center">
        {/* Upper Floating White/Crimson Rage AI Plate */}
        <div
          className="relative z-20 h-24 w-24 rounded-2xl bg-gradient-to-br from-white via-zinc-100 to-red-100 shadow-[0_18px_45px_rgba(239,68,68,0.32)] flex items-center justify-center border border-white"
          style={{ transform: "translateY(8px) rotateX(60deg) rotateZ(-45deg)" }}
        >
          <RageLogo variant="red" className="h-10 w-10" />
        </div>

        {/* Lower Floating Plate */}
        <div
          className="relative z-10 h-24 w-24 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-300 shadow-[0_16px_40px_rgba(220,38,38,0.22)] flex items-center justify-center border border-red-200/80"
          style={{ transform: "translateY(-10px) rotateX(60deg) rotateZ(-45deg)" }}
        >
          <RageLogo variant="red" className="h-10 w-10 opacity-90" />
        </div>

        {/* Dashed Vertical Bus Lines + 4-Tile Isometric Base */}
        <svg viewBox="0 0 360 190" fill="none" className="-mt-6 w-full max-w-[360px] h-auto">
          {/* Dashed vertical beams */}
          <g stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="3 4">
            <line x1="180" y1="6" x2="180" y2="54" stroke="rgba(239,68,68,0.65)" />
            <line x1="122" y1="26" x2="122" y2="84" />
            <line x1="238" y1="26" x2="238" y2="84" />
            <line x1="180" y1="74" x2="180" y2="124" />
          </g>

          {/* 4 isometric base tiles (Gemini, Nemotron, ChatGPT, Workspace) */}
          <g stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeLinejoin="round">
            {/* Top tile */}
            <polygon points="180,46 230,71 180,96 130,71" fill="#140f0f" />
            <polygon points="130,71 180,96 180,104 130,79" fill="#0d0a0a" />
            <polygon points="230,71 180,96 180,104 230,79" fill="#100b0b" />

            {/* Left tile */}
            <polygon points="122,76 172,101 122,126 72,101" fill="#140f0f" />
            <polygon points="72,101 122,126 122,134 72,109" fill="#0d0a0a" />
            <polygon points="172,101 122,126 122,134 172,109" fill="#100b0b" />

            {/* Right tile */}
            <polygon points="238,76 288,101 238,126 188,101" fill="#140f0f" />
            <polygon points="188,101 238,126 238,134 188,109" fill="#0d0a0a" />
            <polygon points="288,101 238,126 238,134 288,109" fill="#100b0b" />

            {/* Front/Bottom highlighted tile */}
            <polygon
              points="180,106 230,131 180,156 130,131"
              fill="#191111"
              stroke="rgba(239,68,68,0.45)"
            />
            <polygon points="130,131 180,156 180,164 130,139" fill="#120b0b" />
            <polygon points="230,131 180,156 180,164 230,139" fill="#150d0d" />
          </g>

          {/* Subtle Labels on base tiles */}
          <g fill="rgba(255,255,255,0.55)" fontSize="8" textAnchor="middle" fontFamily="monospace">
            <text x="180" y="74">GEMINI</text>
            <text x="122" y="104">NEMOTRON</text>
            <text x="238" y="104">OPENAI</text>
            <text x="180" y="134" fill="#fca5a5">WORKSPACE</text>
          </g>
        </svg>
      </div>
    </div>
  )
}

export function BottomCtaPrism() {
  return (
    <div className="relative h-full w-full min-h-[250px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#120d0d] to-[#080606]">
      {/* Intense crimson underglow light spill */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 right-8 h-44 w-56 rounded-full bg-red-600/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-[radial-gradient(ellipse_60%_80%_at_60%_100%,rgba(239,68,68,0.35),transparent_75%)]"
      />

      {/* Reflective isometric floor plane */}
      <div
        className="absolute bottom-6 h-40 w-44 rounded-xl border border-red-500/20 bg-gradient-to-tr from-[#170e0e] via-[#1f1212] to-transparent"
        style={{ transform: "rotateX(65deg) rotateZ(-35deg)" }}
      />

      {/* Vertical 3D dark obsidian monolith slab */}
      <div
        className="relative z-10 h-36 w-28 rounded-2xl border border-white/15 bg-gradient-to-br from-[#231b1b] via-[#120e0e] to-[#080606] shadow-[0_20px_50px_rgba(220,38,38,0.45)] flex items-center justify-center"
        style={{ transform: "perspective(600px) rotateY(-28deg) rotateX(8deg)" }}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-90" />
        <RageLogo
          variant="red"
          className="h-12 w-12 drop-shadow-[0_0_16px_rgba(239,68,68,0.6)]"
        />
      </div>
    </div>
  )
}
