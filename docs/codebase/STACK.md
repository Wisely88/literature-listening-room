# Technology Stack

## Core Sections (Required)

### 1) Runtime Summary

| Area | Value | Evidence |
|---|---|---|
| Primary language | TypeScript 5 strict mode | `tsconfig.json`, `package.json` |
| Runtime + version | Node.js 24.x; verified locally with 24.18.1 | `.nvmrc`, `package.json` |
| Package manager | npm 11.x with lockfile v3 | `package.json`, `package-lock.json` |
| Module/build system | ESM, Next.js App Router, Webpack production build | `package.json`, `app/`, `next.config.ts` |

### 2) Production Frameworks and Dependencies

| Dependency | Version | Role in system | Evidence |
|---|---|---|---|
| Next.js | 16.3.0 | Server rendering, routing and API handlers | `package.json`, `app/` |
| React / React DOM | 19.2.8 | Interactive UI | `package.json`, `components/` |
| Prisma Client | 7.9.1 | Typed data access | `package.json`, `prisma/schema.prisma` |
| better-sqlite3 adapter | 7.9.1 adapter / 12.x transitive driver | SQLite runtime adapter | `package.json`, `lib/db/client.ts` |
| Zod | 4.1.x | Content, route and manifest validation | `lib/content/schema.ts`, `lib/tts/manifest.ts` |
| gray-matter | 4.0.x | Markdown frontmatter parsing | `lib/content/parser.ts` |
| Tencent TTS SDK | 4.1.x | Optional server-side cloud synthesis | `lib/tts/server/tencent-tts-provider.ts` |

### 3) Development Toolchain

| Tool | Purpose | Evidence |
|---|---|---|
| ESLint 9 + Next config | Static analysis | `eslint.config.mjs` |
| Vitest 4.1 + Testing Library | Unit/component/integration tests | `vitest.config.ts`, `tests/` |
| Playwright 1.56 | Browser end-to-end tests | `playwright.config.ts` |
| Prisma CLI 7.9 | Client generation and migrations | `package.json`, `prisma.config.ts` |
| tsx 4.20 | TypeScript CLI scripts | `scripts/`, `package.json` |

### 4) Key Commands

```bash
npm install
npm run lint
npm run test
npm run build
npm run content:validate
npm run content:import
```

### 5) Environment and Config

- Config sources: `.env`, `.env.example`, `next.config.ts`, `prisma.config.ts`, `tsconfig.json`.
- Required local store: `DATABASE_URL`.
- Optional TTS variables: `TENCENTCLOUD_*`, `TENCENT_TTS_*`, `LOCAL_TTS_*`, `FFMPEG_PATH`, `FFPROBE_PATH`.
- Runtime constraint: Node 24.x is required to keep native SQLite ABI consistent.

### 6) Evidence

- `package.json`
- `package-lock.json`
- `.nvmrc`
- `tsconfig.json`
- `next.config.ts`
