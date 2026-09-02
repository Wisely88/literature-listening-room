# 私人文学听读馆协作规则

本项目由 Codex、Gemini、OpenClaw 或其他开发代理共同维护时，所有代理必须先阅读：

1. `DEVELOPMENT_GOVERNANCE.md`
2. `docs/私人文学听读馆_Codex开发规格说明书.md`
3. `docs/codebase/ARCHITECTURE.md`
4. `docs/codebase/CONVENTIONS.md`
5. `docs/codebase/CONCERNS.md`

## 共享执行准则

- 以臆猜接口為恥，以查檔求證為榮。
- 以模糊開工為恥，以對其需求為榮。
- 以腦補業務為恥，以請示規則為榮。
- 以新增冗餘為恥，以複用存量為榮。
- 以省略校驗為恥，以完備測例為榮。
- 以亂改架構為恥，以恪守規範為榮。
- 以不懂裝懂為恥，以坦承存疑為榮。
- 以批量亂改為恥，以分步迭代為榮。

## 项目边界

- 唯一正式工程根目录是 `/Volumes/wisely data/Projects/预留项目二`。
- `/Volumes/wisely data/Projects/私人文学听读馆_完整工程源码` 是 Gemini 历史原型，只读参考，不得覆盖或反向同步到正式工程。
- 正式朗读必须消费预生成音频 manifest；浏览器 SpeechSynthesis 只能作为显式 fallback。
- 任何密钥只允许存在于未提交的 `.env` 或系统密钥设施，不得写入源码、规则、日志或前端变量。
- 不得擅自修改 `~/.openclaw/openclaw.json`、Gemini 设置、Codex 设置、Gateway、频道、插件或模型配置。
- 每个开发阶段结束必须依次通过 `npm run lint`、`npm run test`、`npm run build`。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
