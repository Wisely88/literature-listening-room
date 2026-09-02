# Codebase Concerns

## Core Sections (Required)

### 1) Top Risks (Prioritized)

| Severity | Concern | Evidence | Impact | Suggested action |
|---|---|---|---|---|
| high | 35 of 60 works lack formal audio manifests | `public/audio/`, `content/works/` | Most expanded content uses device fallback | Regenerate and validate per-work MP3 manifests |
| high | Historical Gemini prototype conflicts with formal architecture | sibling project `package.json`, `ReaderView.tsx` | Accidental copy can restore Next 15/Prisma 6/Web Speech primary design | Keep prototype read-only and use project agent rules |
| medium | Dependency audit retains five indirect advisories after safe dev-tool upgrades | `npm audit` output 2026-08-30 | Prisma/Tencent transitive packages remain flagged | Wait for compatible upstream fixes; do not force Prisma 7 to 6 |
| medium | Only rain ambience has a local asset | `lib/ambience/scenes.ts`, `public/ambience/` | Four visible scenes cannot play | Add licensed/local assets before enabling them |
| medium | Repository has no usable commit history | `git log` returned no commits | No reliable rollback or authorship trail | Create a reviewed initial baseline commit and remote backup |

### 2) Technical Debt

| Debt item | Why it exists | Where | Risk if ignored | Suggested fix |
|---|---|---|---|---|
| Audio coverage gap | Content expanded faster than synthesis | `public/audio/` | Inconsistent product experience | Batch-generate, checksum and smoke-test audio |
| Annotation coverage gap | New non-Golden works were added with minimal metadata | `content/works/` | Uneven reading quality | Add verified annotations in editorial batches |
| Turbopack build stall | Default build path stalled locally | former `package.json` build command | Phase gates appear hung | Use verified `next build --webpack` until retested |
| Shared personal data | V1 is private/single-user | `Favorite`, `PlaybackProgress` | Public tunnel users share state | Do not treat public tunnel as multi-user deployment |

### 3) Security Concerns

| Risk | OWASP category | Evidence | Current mitigation | Gap |
|---|---|---|---|---|
| Public tunnel exposes personal-state APIs | A01 | `app/api/favorites`, `app/api/progress` | Exposure requires user approval | No authentication or per-user isolation |
| Long-lived cloud credentials | A02 | `.env.example`, Tencent provider | Server-only variables and gitignore | No secret rotation/temporary credential workflow |
| Dependency advisories | A06 | npm audit summary | Pinned lockfile | Advisories not yet triaged |
| Content source trust | N/A | Markdown/JSON repository | Zod and rights validation | Editorial accuracy is not automatically verifiable |

### 4) Performance and Scaling Concerns

| Concern | Evidence | Current symptom | Scaling risk | Suggested improvement |
|---|---|---|---|---|
| File content is parsed on requests/build | `lib/content/repository.ts` | Acceptable at 60 works | Larger libraries increase I/O | Add build-time index/cache only when measured |
| SQLite is single-host | `prisma/schema.prisma` | Appropriate for private V1 | Multi-instance writes do not scale | Preserve V1 boundary; migrate only with explicit scope |
| Static MP3 footprint grows linearly | `public/audio/` | 125 MP3 files | Deployment size grows with corpus | Define retention and storage policy before bulk import |

### 5) Fragile/High-Churn Areas

| Area | Why fragile | Churn signal | Safe change strategy |
|---|---|---|---|
| `lib/player/` + `components/player/` | Browser media lifecycle and resume state interact | No Git history available | Change reducer/provider tests together |
| `content/` + `prisma/seed.ts` | IDs connect annotations, audio and progress | 60 works added in batches | Validate and import after each editorial batch |
| `scripts/generate-local-audio.ts` | OS processes, codecs and atomic files | Platform-dependent behavior | Keep mocked tests and run one real segment smoke test |

### 6) `[ASK USER]` Questions

No unresolved architecture choice is required for this rules-only change. A future long-term public deployment will require a separate user decision about authentication and hosting.

### 7) Evidence

- `/tmp/literature-codebase-scan.txt` generated 2026-08-30
- `docs/私人文学听读馆_Codex开发规格说明书.md`
- `components/player/audio-player.tsx`
- `lib/ambience/scenes.ts`
- `prisma/schema.prisma`
- `package.json`
