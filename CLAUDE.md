# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UIGen** is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates them into a virtual file system that is transpiled and rendered in an iframe—no files are written to disk.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest test suite
npm run db:reset     # Reset SQLite database (destructive)
```

All scripts prepend `NODE_OPTIONS='--require ./node-compat.cjs'` for Turbopack compatibility.

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Environment

`.env` requires:
- `ANTHROPIC_API_KEY` — optional; without it the app uses a mock LLM that returns static code
- `JWT_SECRET` — for signing session tokens

## Architecture

### Data Flow

1. User submits chat message → `/api/chat` route streams response via SSE
2. Claude uses `str_replace_editor` and `file_manager` tools to write/modify files in the **virtual file system** (in-memory, not disk)
3. The JSX transformer (`/src/lib/transform/jsx-transformer.ts`) converts virtual files to browser-executable JS using Babel
4. The preview iframe renders the transformed output live
5. For authenticated users, the virtual file system and messages are serialized to JSON and persisted in SQLite via Prisma

### Key Abstractions

- **Virtual File System** (`/src/lib/file-system.ts`): In-memory FS with CRUD ops; serializable to JSON for DB persistence. The AI always writes to `/App.jsx` as the entry point.
- **AI Tools** (`/src/lib/tools/`): `str_replace_editor` (create/view/edit files) and `file_manager` (mkdir/delete/list) expose the virtual FS to Claude.
- **JSX Transformer** (`/src/lib/transform/jsx-transformer.ts`): Client-side Babel transform that converts JSX + `@/` imports into browser-runnable code.
- **System Prompt** (`/src/lib/prompts/generation.tsx`): Instructs Claude to use Tailwind CSS, `@/` import aliases, and `/App.jsx` as the component entry point.
- **Provider** (`/src/lib/provider.ts`): Selects between real Claude (`claude-haiku-4-5`) and mock LLM based on `ANTHROPIC_API_KEY` presence.

### State Management

- `ChatContext` (`/src/lib/contexts/chat-context.tsx`): Manages chat messages and streaming state
- `FileSystemContext` (`/src/lib/contexts/file-system-context.tsx`): Manages virtual FS state and exposes it to components

### Auth

JWT sessions (HS256, 7-day expiry) stored in httpOnly cookies. Server actions in `/src/actions/index.ts` handle sign-up/sign-in/sign-out. `middleware.ts` protects `/api/projects` routes.

### Database

SQLite via Prisma. Two models:
- `User`: email + bcrypt password
- `Project`: stores `messages` (JSON array) and `data` (serialized virtual FS JSON), with optional `userId` for anonymous projects

Schema at `prisma/schema.prisma`.

## Testing

Tests use Vitest + Testing Library with jsdom. Test files live alongside source in `__tests__/` subdirectories. Coverage areas: virtual FS, contexts, JSX transformer, chat and editor components.
