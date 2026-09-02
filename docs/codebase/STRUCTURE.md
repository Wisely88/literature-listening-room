# Codebase Structure

## Core Sections (Required)

### 1) Top-Level Map

| Path | Purpose | Evidence |
|---|---|---|
| `app/` | Next.js pages and HTTP route handlers | `app/layout.tsx`, `app/api/` |
| `components/` | Client and server UI by feature | `components/player/`, `components/reader/` |
| `lib/content/` | Content schemas, parsing, querying and repository | `lib/content/repository.ts` |
| `lib/player/` | Playback state machine and audio lifecycle | `lib/player/provider.tsx` |
| `lib/tts/` | TTS contracts, manifest validation and providers | `lib/tts/types.ts` |
| `lib/library/` | Favorites and playback-progress persistence | `lib/library/personal-data.ts` |
| `content/` | Versioned work and author sources | `content/works/`, `content/authors/` |
| `prisma/` | Schema, migrations, seed and SQLite database | `prisma/schema.prisma` |
| `scripts/` | Content and audio CLI workflows | `scripts/generate-local-audio.ts` |
| `public/` | Browser-served audio, ambience and manifest assets | `public/audio/`, `public/ambience/` |
| `tests/` | Vitest suites and shared setup | `tests/setup.ts` |
| `docs/` | Product specification and architecture reference | `docs/私人文学听读馆_Codex开发规格说明书.md` |

### 2) Entry Points

- Main runtime entry: `app/layout.tsx`, with routes rooted in `app/`.
- API entry points: `app/api/**/route.ts`.
- CLI entry points: `scripts/*.ts` and `prisma/seed.ts`, selected by `package.json` scripts.
- Production start: `npm run build`, then `npm start`.

### 3) Module Boundaries

| Boundary | What belongs here | What must not be here |
|---|---|---|
| `app/` | Routing, request parsing and page composition | Direct TTS credentials or raw file mutation |
| `components/` | Rendering and user interactions | Prisma access or provider credentials |
| `lib/content/` | Canonical content rules | UI state or network tunnelling |
| `lib/tts/` | Provider interfaces and audio manifests | Browser page layout |
| `lib/player/` | Playback state and audio element coordination | Cloud synthesis calls |
| `scripts/` | Explicit operator workflows | Code imported by browser bundles |

### 4) Naming and Organization Rules

- Feature directories use lowercase names; most source files use kebab-case.
- React component exports use PascalCase even when filenames are kebab-case.
- Dynamic routes use Next.js bracket syntax such as `[slug]`.
- `@/*` maps to the repository root; cross-feature imports use the alias.

### 5) Evidence

- `/tmp/literature-codebase-scan.txt` generated 2026-08-30
- `package.json`
- `tsconfig.json`
- `app/work/[slug]/page.tsx`
- `lib/content/repository.ts`
