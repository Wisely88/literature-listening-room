# Architecture

## Core Sections (Required)

### 1) Architectural Style

- Primary style: layered Next.js application with feature-oriented UI modules.
- Why this classification: pages and APIs compose repositories/providers; parsing, persistence, TTS and playback remain separate modules.
- Primary constraints: private-first deployment, pre-generated formal audio, content rights validation, SQLite single-host persistence.

### 2) System Flow

```text
Markdown/JSON -> content parser/repository -> Next page/API -> components -> player/TTS manifest -> browser audio
                                      \-> Prisma adapter -> SQLite -> favorites/progress
```

1. `lib/content/repository.ts` reads work and author sources.
2. `lib/content/parser.ts` validates frontmatter, sections and segment references.
3. pages such as `app/work/[slug]/page.tsx` compose content, manifest and personal data.
4. `ReadingRoom` renders tabs and passes the manifest to `AudioPlayer`.
5. `PlayerProvider` owns audio elements, playback rate, progress and segment changes.
6. server routes persist favorites and progress through `lib/library/personal-data.ts`.

### 3) Layer/Module Responsibilities

| Layer or module | Owns | Must not own | Evidence |
|---|---|---|---|
| Content repository | Reading and joining canonical content | UI rendering | `lib/content/repository.ts` |
| Content parser | Schema and section validation | Database mutations | `lib/content/parser.ts` |
| Pages/API | Route composition and HTTP boundaries | Provider secrets in client code | `app/`, `app/api/` |
| Player | Segment audio lifecycle and progress | TTS generation | `lib/player/provider.tsx` |
| TTS providers | Server-side synthesis/registration contracts | Browser fallback UI | `lib/tts/server/` |
| Personal data | Favorites and resume progress | Content parsing | `lib/library/personal-data.ts` |

### 4) Reused Patterns

| Pattern | Where found | Why it exists |
|---|---|---|
| Repository | `lib/content/repository.ts` | Keeps pages independent of content storage format |
| Strategy/provider | `lib/tts/types.ts`, `lib/tts/server/` | Allows local/manual/cloud audio without coupling UI |
| Reducer/state machine | `lib/player/reducer.ts` | Makes playback transitions testable |
| Schema validation | `lib/content/schema.ts`, `lib/tts/manifest.ts` | Rejects malformed content before runtime |
| Server-only boundary | `lib/tts/server/*` | Prevents credentials from entering browser bundles |

### 5) Known Architectural Risks

- Only 25 of 60 works currently have formal audio manifests; missing works fall back to device speech.
- SQLite favorites/progress are shared by the running instance rather than separated by authenticated user.
- Only rain ambience has a local asset; other scene definitions intentionally have no URL.
- The historical Gemini prototype uses incompatible Next 15/Prisma 6/Web Speech assumptions and must remain read-only.

### 6) Evidence

- `docs/私人文学听读馆_Codex开发规格说明书.md`
- `app/work/[slug]/page.tsx`
- `components/player/audio-player.tsx`
- `lib/player/provider.tsx`
- `lib/tts/types.ts`
- `prisma/schema.prisma`
