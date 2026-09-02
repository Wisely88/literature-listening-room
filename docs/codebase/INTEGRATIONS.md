# External Integrations

## Core Sections (Required)

### 1) Integration Inventory

| System | Type | Purpose | Auth model | Criticality | Evidence |
|---|---|---|---|---|---|
| SQLite | Local DB | Works, authors, favorites, progress and TTS jobs | Local file access | high | `prisma/schema.prisma` |
| Tencent Cloud TTS | Optional API | Pre-generate cloud speech audio | SecretId/SecretKey in server env | medium | `lib/tts/server/tencent-tts-provider.ts` |
| macOS `say` | Local process | Generate local AIFF speech | OS process permission | medium | `scripts/generate-local-audio.ts` |
| ffmpeg/ffprobe | Local process | Encode MP3 and measure duration | Executable path | medium | `scripts/generate-local-audio.ts` |
| Browser Speech API | Browser API | Explicit fallback when formal audio is absent | None | low | `lib/tts/browser-speech-fallback.ts` |
| Temporary tunnel | External proxy | User-authorized temporary external access | Provider local client | low | operational only; no project config |

### 2) Data Stores

| Store | Role | Access layer | Key risk | Evidence |
|---|---|---|---|---|
| `prisma/dev.db` | Local application database | `lib/db/client.ts`, Prisma | Single-host and shared personal state | `prisma.config.ts` |
| `content/` | Canonical editable content | `lib/content/repository.ts` | Markdown and DB can diverge until import | `scripts/import-content.ts` |
| `public/audio/` | Browser audio and manifests | manifest loader/player | 35 works still lack formal manifests | `lib/tts/server/manifest-loader.ts` |
| `public/ambience/` | Local environment sounds | `lib/ambience/scenes.ts` | Only rain is populated | `public/ambience/rain-soft.mp3` |

### 3) Secrets and Credentials Handling

- Credential source: `.env`; only empty names/defaults belong in `.env.example`.
- Tencent credentials are read only by server/provider code.
- No `NEXT_PUBLIC_` credential is defined.
- Rotation/lifecycle: `[TODO]` managed manually; no secrets manager is configured.

### 4) Reliability and Failure Behavior

- Local audio processes use timeouts, safe argument arrays and cleanup.
- Tencent provider validates response audio; generation scripts remain operator-triggered.
- Missing formal audio degrades to a clearly labelled browser fallback.
- Temporary tunnels have no uptime guarantee and are not deployment infrastructure.

### 5) Observability for Integrations

- CLI scripts log work/segment progress and fail with non-zero status.
- No centralized metrics, tracing or remote log collector is configured.
- Provider request identifiers may be stored as non-secret metadata; secrets and audio base64 must not be logged.

### 6) Evidence

- `.env.example`
- `lib/tts/server/tencent-tts-provider.ts`
- `scripts/generate-local-audio.ts`
- `lib/db/client.ts`
- `lib/ambience/scenes.ts`
