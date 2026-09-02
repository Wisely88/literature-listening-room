# Coding Conventions

## Core Sections (Required)

### 1) Naming Rules

| Item | Rule | Example | Evidence |
|---|---|---|---|
| Files | kebab-case by default; existing legacy React tab file is an exception | `audio-player.tsx` | `components/player/` |
| Functions/methods | camelCase; exported operations are verb-led | `loadAudioManifest` | `lib/tts/server/manifest-loader.ts` |
| Types/interfaces | PascalCase | `AudioManifest`, `TTSProvider` | `lib/tts/types.ts` |
| Constants/env vars | constants use UPPER_SNAKE_CASE; env vars use scoped prefixes | `AUDIO_FORMATS`, `TENCENT_TTS_SPEED` | `lib/tts/types.ts`, `.env.example` |

### 2) Formatting and Linting

- Formatter: no standalone formatter is configured; follow existing TypeScript formatting.
- Linter: ESLint 9 using `eslint.config.mjs`, Next core-web-vitals and TypeScript rules.
- TypeScript: `strict`, `noEmit`, bundler resolution and isolated modules.
- Run commands: `npm run lint`, `npm run test`, `npm run build`.

### 3) Import and Module Conventions

- External imports precede project imports; type-only imports use `import type`.
- Cross-feature imports use `@/`; same-folder imports may be relative.
- Barrel exports are limited to stable public module surfaces such as `lib/content/index.ts` and `lib/tts/index.ts`.
- Server integrations must remain below `lib/tts/server/` and include a server-only boundary.

### 4) Error and Logging Conventions

- Parser validation throws `ContentValidationError` with structured issues.
- HTTP routes return JSON envelopes and explicit 400/404 responses.
- CLI scripts catch at the entry point, print a concise error and set a non-zero exit code.
- Secrets, Audio base64 and credential values must never be logged.

### 5) Testing Conventions

- Tests live under `tests/<feature>/` and end in `.test.ts` or `.test.tsx`.
- Browser APIs and `server-only` are isolated through `tests/setup.ts` and Vitest aliases.
- New behavior requires proportionate tests; phase completion requires the full suite.
- Coverage threshold: `[TODO]` no enforced numeric threshold is configured.

### 6) Evidence

- `eslint.config.mjs`
- `tsconfig.json`
- `vitest.config.ts`
- `lib/content/parser.ts`
- `app/api/progress/route.ts`
