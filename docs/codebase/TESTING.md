# Testing Patterns

## Core Sections (Required)

### 1) Test Stack and Commands

- Primary test framework: Vitest 4.1.11.
- Assertion/mocking tools: Vitest `expect`/`vi`, Testing Library and user-event.
- Browser E2E: Playwright 1.56.1.

```bash
npm run test
npm run test -- tests/content
npm run test:e2e
npm run lint
npm run build
```

### 2) Test Layout

- Tests are grouped under `tests/<feature>/`.
- Naming convention: `*.test.ts` and `*.test.tsx`.
- Global browser/test setup: `tests/setup.ts`.
- `server-only` is replaced by `tests/server-only-stub.ts` through `vitest.config.ts`.

### 3) Test Scope Matrix

| Scope | Covered? | Typical target | Notes |
|---|---|---|---|
| Unit | yes | parsers, reducers, manifest/provider helpers | No real cloud calls |
| Component | yes | reader, player, theme, ambience, library | jsdom and mocked media APIs |
| Integration | yes | content routes and seed behavior | Local fixtures/DB boundaries |
| E2E | configured | browser user flows | Playwright config exists; not part of default `npm test` |

### 4) Mocking and Isolation Strategy

- Browser media, localStorage and speech behavior are stubbed in test setup or per suite.
- Cloud TTS is tested at provider boundaries without sending real credentials.
- Audio-generation tests mock process execution and filesystem boundaries.
- Common failure mode: running under an unsupported Node/DOM combination can change browser API availability.

### 5) Coverage and Quality Signals

- Coverage tool + threshold: `[TODO]` no numeric coverage gate is configured.
- Current suite signal: 22 test files and 77 tests passed on 2026-08-30.
- Required phase gate: lint, full Vitest suite and production build.
- E2E remains a separate operator command.

### 6) Evidence

- `package.json`
- `vitest.config.ts`
- `playwright.config.ts`
- `tests/setup.ts`
- `tests/audio-generation/generate-local-audio.test.ts`
