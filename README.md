<div align="center">
  <img src="./public/logo.png" alt="Rage AI Logo" width="110" />
  <h1>Rage AI</h1>
  <p><strong>Crimson-Obsidian Personal AI Workspace Assistant — BYOK, Multi-Model &amp; Zero-OAuth Built-In Tools</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.1-0b0909?style=for-the-badge&logo=next.js&logoColor=ef4444" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/TypeScript-5-0b0909?style=for-the-badge&logo=typescript&logoColor=ef4444" alt="TypeScript" />
    <img src="https://img.shields.io/badge/LangGraph-Agent-dc2626?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-0b0909?style=for-the-badge&logo=tailwindcss&logoColor=ef4444" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Prisma-Neon_PostgreSQL-0b0909?style=for-the-badge&logo=prisma&logoColor=ef4444" alt="Prisma & Neon" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/Google_Gemini-Free_Tier-ef4444?style=flat-square&logo=googlegemini&logoColor=white" alt="Google Gemini Free Tier" />
    <img src="https://img.shields.io/badge/NVIDIA_Nemotron-Free_NIM-dc2626?style=flat-square&logo=nvidia&logoColor=white" alt="NVIDIA Nemotron Free NIM" />
    <img src="https://img.shields.io/badge/OpenAI-GPT--5_%2F_4o-b91c1c?style=flat-square&logo=openai&logoColor=white" alt="OpenAI GPT-5" />
    <img src="https://img.shields.io/badge/Auth-Minimal_Google_OAuth-141010?style=flat-square&logo=google&logoColor=white" alt="Minimal Google OAuth" />
  </p>
</div>

---

## Overview

**Rage AI** is a fast, bring-your-own-key (BYOK) AI workspace assistant built with Next.js 16, LangGraph, and Neon PostgreSQL. Sign in with minimal Google OAuth (`openid`, `email`, `profile`), keep your API keys, webhooks, and resume profile in your browser, and automate real tasks across Google Workspace and the open web.

## Key Features

- **Multi-Model BYOK + Free-Tier Ready**
  - **Google Gemini (AI Studio Free Tier):** `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-flash-latest`, `gemini-2.5-flash`
  - **NVIDIA Nemotron (Free NIM Endpoints):** `nvidia/nemotron-3.5-super-vl-120b-a12b`, `nvidia/nemotron-3.5-lightning-30b-a3b`, `nvidia/llama-3.3-nemotron-super-49b-v1.5`, `nvidia/nemotron-3.5-bolt-e4b`
  - **OpenAI / ChatGPT:** `gpt-5`, `gpt-5-chat-latest`, `gpt-4o`, `gpt-4o-mini`
- **Auto-Failover & Side-by-Side Versus Mode**
  - Automatically switches to another configured provider if a free tier hits a `429` rate limit or `503`.
  - Toggle **Versus** in the composer to stream and compare two models side-by-side on the same prompt.
- **Resume Job Scraper & Outreach Pipeline (`scrape_jobs`)**
  - Upload or paste your resume inside **Keys, Webhooks & Resume**.
  - Scrapes live roles from **RemoteOK**, **Remotive**, **Arbeitnow**, and custom **Greenhouse**, **Lever**, or career URLs, scores them against your skills, saves a tailored **Google Doc** brief, drafts **Gmail** outreach, schedules **Google Calendar** follow-ups, and pushes digests to **Discord / Slack**.
- **Zero-OAuth Built-In Tools**
  - `read_webpage` — SSRF-safe public URL & article extraction via Cheerio
  - `youtube_transcript` — Timestamped YouTube caption extraction & summarization
  - `github_repo_inspector` — Public repo overview, README, issues & releases
  - `send_webhook_notification` — Direct **Discord** & **Slack** webhook alerts
  - `tavily_search` — Optional live web search & citations
- **Workspace Power Tools**
  - **Minimal Google OAuth** at login; selectively toggle **Gmail**, **Google Calendar**, and **Google Docs** on demand.
  - **1-Click Morning Briefing**, **Voice Input** (`SpeechRecognition`), **Live Tool-Trace Pills**, and an **Artifact Preview Drawer** (sandboxed HTML/SVG preview, Markdown & `.ics` export).

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| **Agent & LLMs** | LangGraph, `@langchain/google-genai`, `@langchain/openai`, `@langchain/tavily`, Cheerio |
| **Database & Auth** | Neon PostgreSQL, Prisma ORM, NextAuth.js (Google OAuth + selective app scopes) |
| **UI & Motion** | Tailwind CSS v4, Radix UI, Framer Motion, Lucide, React Icons |
| **Data & State** | TanStack Query, browser `localStorage` for BYOK keys, webhooks & resume |

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/abhinxvz/rageAI.git
cd rageAI
bun install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
NODE_ENV=development

# Database (PostgreSQL / Neon)
DATABASE_URL="postgresql://user:password@localhost:5432/rageai"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
MAX_USER_MESSAGES_PER_CHAT=20
MAX_OUTPUT_TOKENS=2048

# Google OAuth (Sign-in + Optional Gmail, Calendar, Docs)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional Web Search (Tavily)
TAVILY_API_KEY="your-tavily-api-key"
```

Add these **Authorized redirect URIs** in Google Cloud Console:
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google-app`

### 3. Push Database Schema & Run

```bash
bun run db:generate
bun run db:push
bun run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and add your Gemini / Nemotron / OpenAI keys, webhooks, or resume in the **Keys & Resume** modal.

## Project Structure

```text
rageAI/
├── prisma/                         # Prisma PostgreSQL schema
├── public/                         # Logo, fonts, and static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── apps/               # On-demand Google Workspace connect/disconnect
│   │   │   ├── auth/               # NextAuth + Google app OAuth callback
│   │   │   ├── chat/               # Streaming LangGraph chat & history APIs
│   │   │   ├── config/             # Runtime limits & OAuth status
│   │   │   └── conversations/      # Thread CRUD APIs
│   │   ├── auth/                   # Crimson Sign-in & Auth Error pages
│   │   ├── chat/                   # Workspace chat & thread pages
│   │   ├── privacy/ & terms/       # Legal pages
│   │   └── page.tsx                # Rage AI landing page
│   ├── components/
│   │   ├── chat/                   # ChatInterface, Composer, ArtifactDrawer, Sidebars
│   │   ├── keys-manager.tsx        # BYOK keys, webhooks & resume manager
│   │   └── landing-visuals.tsx     # Isometric & wireframe crimson visuals
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth & selective Google OAuth scopes
│   │   ├── models.ts               # Gemini, Nemotron NIM & OpenAI registry
│   │   ├── job-tools.ts            # Live job scraper & resume scorer
│   │   ├── web-tools.ts            # Webpage, YouTube, GitHub & webhook tools
│   │   └── prompt.ts               # Rage AI agent system prompt
│   └── services/                   # ChatService, ConversationService, AppPermissionService
└── middleware.ts                   # Protected /chat routes
```

## Scripts

```bash
bun run dev          # Start development server
bun run build        # Production build
bun run start        # Start production server
bun run type-check   # TypeScript check (tsc --noEmit)
bun run lint         # ESLint check
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema to database
```

## Author

**Abhinav** — [@abhinxvz](https://github.com/abhinxvz)
