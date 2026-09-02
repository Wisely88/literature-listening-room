# 统一开发环境主规则表

## 目的与适用范围

本表是 `/Volumes/wisely data/Projects/预留项目二` 的跨工具开发主规则。Codex、Gemini、OpenClaw、Claude 或其他代理进入本项目时均须遵守。它只约束开发协作，不替代各工具自身的身份、模型、频道、插件、记忆和启动配置。

## 当前本机开发环境架构

| 层级 | 当前标准 | 边界 |
|---|---|---|
| 项目存储 | `/Volumes/wisely data/Projects` | `~/Documents` 仅作兼容入口；执行前用 `pwd -P` 确认真实路径 |
| 正式文学馆 | `/Volumes/wisely data/Projects/预留项目二` | 唯一可继续开发、测试和部署的文学馆工程 |
| Gemini 历史原型 | `/Volumes/wisely data/Projects/私人文学听读馆_完整工程源码` | 只读参考；不得覆盖正式工程 |
| Node.js | 24.x，当前验证版本 24.18.1 | 不得临时切换 Node ABI 后继续复用旧原生依赖 |
| 包管理器 | npm 11.x + `package-lock.json` | 不混用 yarn/pnpm；依赖更新必须审查锁文件 |
| Web | Next.js 16 App Router + React 19 + TypeScript strict | 写代码前读取本项目 `node_modules/next/dist/docs/` 对应文档 |
| 数据 | Prisma 7 + better-sqlite3 + SQLite | Schema、migration、seed 三者必须一致 |
| 内容 | Markdown/JSON → repository → Prisma/import | 内容必须先 validate，再 import |
| 音频 | TTSProvider → 预生成 MP3 → manifest → PlayerProvider | SpeechSynthesis 仅 fallback |
| 测试 | ESLint + Vitest + Playwright + production build | 阶段门禁不可跳过 |
| 外网 | 本机服务与隧道分层 | 公网暴露必须用户明确授权，临时隧道不可冒充长期部署 |

## 工具一致性规则

| 规则 | Codex | Gemini | OpenClaw |
|---|---|---|---|
| 进入项目先读 `AGENTS.md` | 必须 | 必须 | 必须 |
| 先确认 `pwd -P`、Git 状态、Node 版本 | 必须 | 必须 | 必须 |
| 遵守主规格与现有架构 | 必须 | 必须 | 必须 |
| 保留其他工具已有配置 | 必须 | 必须 | 必须 |
| 修改前查官方/本地文档 | 必须 | 必须 | 必须 |
| 不读取或输出无关密钥 | 必须 | 必须 | 必须 |
| 完成后运行三项门禁 | 必须 | 必须 | 必须 |
| 不能验证时明确报告 | 必须 | 必须 | 必须 |

## 禁止事项

- 不得从历史原型批量覆盖正式工程。
- 不得把浏览器 SpeechSynthesis 恢复为正式朗读。
- 不得新增社交、评论、会员、广告、支付、推荐算法或大型 CMS。
- 不得使用 `git reset --hard`、清空目录、覆盖数据库或删除用户改动，除非用户明确授权且已有可恢复备份。
- 不得擅自编辑 `~/.openclaw/openclaw.json`、Gateway、频道、模型、插件、Gemini/Codex 全局设置或系统启动项。
- 不得在 `.env.example`、文档、日志或前端 bundle 中写真实 SecretId、SecretKey、Token。

## 标准工作流

1. 确认真路径、Git 状态、Node/npm 版本和项目入口。
2. 阅读主规格、相关代码、Next.js 本地文档和现有测试。
3. 明确变更边界，复用现有 repository/provider/component。
4. 小步修改；不处理任务外文件。
5. 内容变更执行 `npm run content:validate` 和 `npm run content:import`。
6. 阶段结束执行 `npm run lint`、`npm run test`、`npm run build`。
7. 报告实际通过项、失败项、未验证项和后续阻塞。

## 冲突处理

优先级从高到低：用户当前明确指令 → 项目唯一主规格 → `AGENTS.md` → 本表 → 工具自身通用习惯。若工具运行规则与项目规则冲突，停止业务写入并报告，不得自行选择性忽略。
