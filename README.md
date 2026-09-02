# 私人文学听读馆

一个个人自用优先的沉浸式文学听读应用：自然人声朗读、原文阅读、注释、白话、创作背景、作者介绍与轻环境声。

当前唯一完整 Golden Sample 是《记承天寺夜游》。项目遵循 docs/私人文学听读馆_Codex开发规格说明书.md 分阶段实现。

## 技术栈

- Next.js 16（App Router）+ React 19 + TypeScript strict
- Tailwind CSS 4
- Prisma 7 + SQLite（better-sqlite3 适配器）
- Vitest + Testing Library + Playwright

## 从零启动

依次运行：

    npm install
    cp .env.example .env
    npm run db:migrate
    npm run content:validate
    npm run content:import
    npm run dev

打开 http://localhost:3000 ，进入《记承天寺夜游》即可听、读与看注释。

## 内容与音频

内容为 Markdown + Front Matter，位于 content/ 目录。校验与导入：

    npm run content:validate
    npm run content:import

本地预生成自然朗读（macOS say 转 AIFF，再经 ffmpeg 转 MP3，写入 public/audio/<slug>/）：

    npm run audio:generate:local

生成的 manifest.json 包含逐段 url、durationMs、checksum 与 sourceHash。播放器只消费预生成音频；浏览器系统朗读仅是显式 fallback，不充当正式 TTS。

## 环境变量

见 .env.example。本地音频生成还可通过以下变量覆盖工具路径与音色：

- LOCAL_TTS_VOICE：macOS say 音色（默认 Tingting）
- LOCAL_TTS_SAY_PATH、FFMPEG_PATH、FFPROBE_PATH：外部工具路径

腾讯云 TTS 尚未启用：需要真实凭据并在接入时核对最新官方接口，避免把易变参数硬编码。

## 质量门禁

每个开发阶段完成后必须全部通过：

    npm run lint
    npm run test
    npm run build

## 版权

所有作品必须带 rightsStatus。unknown 与 personal-reference 不允许进入公开内容库。古文原文、现代注释与译文分别判断版权。
