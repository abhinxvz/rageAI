# Rage AI

A powerful AI chat application with multi-model support and third-party integrations. Built with Next.js 15, TypeScript, and LangChain.

![Rage AI](./rageAI-nobg.png)

## Features

- **Multi-Model AI Support** - OpenAI, Google Gemini, Mistral AI
- **Advanced Chat Interface** - Thread management, markdown rendering, code highlighting
- **Third-Party Integrations** - GitHub, Gmail, Google Drive, Notion, Spotify, Twitter, Instagram, Discord
- **Secure Authentication** - NextAuth with OAuth providers
- **Modern UI** - Beautiful components with Tailwind CSS and Framer Motion
- **Database** - PostgreSQL with Prisma ORM
- **Real-time Streaming** - AI responses with streaming support

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI/ML:** LangChain, OpenAI SDK, Google Generative AI
- **Database:** PostgreSQL (Neon) with Prisma
- **Authentication:** NextAuth.js
- **UI Components:** Radix UI, Framer Motion
- **State Management:** TanStack Query

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon serverless)
- API keys for AI models (OpenAI, Google, etc.)
- OAuth credentials for third-party integrations

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/abhinxvz/rageAI.git
cd rageAI
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
# or
bun install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# AI Models
OPENAI_API_KEY="your_openai_key"
GOOGLE_GENERATIVE_AI_API_KEY="your_google_key"
MISTRAL_API_KEY="your_mistral_key"

# OAuth Providers
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Add other OAuth credentials as needed
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
rageAI/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── api/        # API routes
│   │   ├── auth/       # Authentication pages
│   │   └── chat/       # Chat interface
│   ├── components/     # React components
│   │   ├── chat/       # Chat-specific components
│   │   └── ui/         # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and integrations
│   ├── services/       # Business logic layer
│   └── types/          # TypeScript type definitions
└── middleware.ts       # Next.js middleware
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript type checking
npm run validate     # Run type-check and lint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

## Integrations

Rage AI supports multiple third-party integrations:

- **GitHub** - Repository management, issues, pull requests
- **Gmail** - Email reading and sending
- **Google Drive** - File access and management
- **Notion** - Database and page operations
- **Spotify** - Music playback control
- **Twitter** - Tweet posting and timeline access
- **Instagram** - Media posting and feed access
- **Discord** - Server and channel management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Author

**Abhinav**
- GitHub: [@abhinxvz](https://github.com/abhinxvz)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [LangChain](https://langchain.com/)
- UI components from [Radix UI](https://radix-ui.com/)
- Animations by [Framer Motion](https://framer.com/motion/)
