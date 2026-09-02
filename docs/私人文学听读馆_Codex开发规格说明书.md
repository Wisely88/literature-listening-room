# 私人文学听读馆（Web）— Codex 开发规格说明书

> 文档用途：直接交给 Codex 作为项目落地规格与执行依据  
> 产品形态：个人自用优先的网页版文学听读应用（后续可迁移/复用到微信小程序）  
> 文档状态：V1.0  
> 核心关键词：听书、阅读、古文、诗词、散文、志怪、推理、作者介绍、创作背景、注释、白话、自然人声、氛围声、沉浸阅读

---

## 0. 一句话产品定义

做一个“可以安静待一会儿的私人文学听读馆”：用户既能像听书一样听自然人声朗读，也能同步阅读原文、查看注释、白话、作者介绍与创作背景，并可叠加雨声、海浪、篝火等轻环境音，形成区别于普通听书播放器的沉浸式文学体验。

---

# 1. 产品目标

## 1.1 核心目标

V1 必须解决以下 5 件事：

1. 能按分类找到值得读/听的文章。
2. 能稳定、自然地播放高质量中文朗读。
3. 能在听的同时阅读原文，并按段落/语义片段跟随播放状态。
4. 能查看文章背景、作者介绍、注释、白话译文等辅助内容。
5. 能叠加轻环境音，形成舒服、不打扰朗读的沉浸氛围。

## 1.2 产品气质

不是“网文平台”，不是“知识课程平台”，也不是“纯 TTS 工具”。

产品气质应为：

- 安静
- 克制
- 文学感
- 温暖
- 低刺激
- 可长期使用
- 可独处
- 适合睡前、休息、散步、夜间阅读

视觉上避免：

- 直播式强运营
- 大量红点
- 金币、签到、任务中心
- 强推荐流
- 过多弹窗
- 夸张渐变和短视频化 UI

---

# 2. 使用场景

主要使用场景：

- 晚上躺在床上听 10～30 分钟。
- 工作间隙听一篇短文。
- 古文阅读时边听边看注释。
- 睡前选择雨声 + 低音量朗读。
- 想了解某篇文章时，看作者和创作背景。
- 想听短篇志怪、推理、惊悚故事。
- 不知道听什么时按“时间长度 / 心情”选择。

V1 暂不做复杂社交。

---

# 3. 内容范围与分类

## 3.1 一级分类

首版支持：

- 古文
- 诗词
- 经典小说
- 散文
- 志怪怪谈
- 推理探案
- 恐怖惊悚
- 传记 / 自传
- 历史小品
- 思想随笔
- 优秀文章
- 私人收藏

后续可扩展：

- 外国文学
- 旅行文学
- 科幻短篇
- 寓言
- 戏剧
- 演讲
- 日记 / 书信
- 哲学短文
- 睡前精选

## 3.2 内容原则

只以“值得读、值得听”为核心标准。

首版种子内容优先使用：

- 中国古典公版作品
- 已进入公版领域的作品
- 用户拥有合法使用权的文本
- 用户本人撰写/整理的内容
- 明确允许使用的授权文本

现代散文、现代诗、当代小说、公众号文章等不得默认打包进公开版本。

每一篇作品必须带版权状态字段，具体见数据模型。

---

# 4. V1 范围

## 4.1 V1 必做

### A. 首页

包含：

- 产品标题/一句话
- 搜索框
- 分类入口
- “今晚听什么”
- 最近播放
- 精选文章
- 按时长选择：
  - 5 分钟
  - 10 分钟
  - 20 分钟
  - 30 分钟+
- 按心情选择：
  - 放松
  - 夜读
  - 来点刺激
  - 想点事情
  - 古典
  - 随便听一篇

### B. 分类书架

支持：

- 分类切换
- 搜索
- 标签筛选
- 作者筛选
- 时长筛选
- 排序：
  - 最近加入
  - 最短
  - 最长
  - 私人收藏

### C. 作品详情 / 阅读页

必须有：

- 标题
- 作者
- 朝代/年代
- 类型
- 预计朗读时长
- 封面/氛围图
- 原文
- 注释
- 白话译文
- 创作背景
- 作者介绍
- 作品简析/赏析（可选但数据结构必须支持）
- 朗读播放器
- 环境音控制
- 收藏
- 播放进度
- 上一篇/下一篇

### D. 自然朗读

必须支持：

- 播放
- 暂停
- 继续
- 前进 15 秒
- 后退 15 秒
- 播放速度
- 音色
- 播放进度
- 断点续播
- 播完自动停
- 下一篇（可关闭）
- 文章段落跟随高亮

### E. 环境声音

首版提供：

- 雨声
- 海浪
- 篝火
- 夜虫
- 风声

播放器必须允许：

- 独立开/关
- 独立调音量
- 与朗读同时播放
- 环境音默认低于朗读
- 记住上次设置

### F. 收藏与进度

支持：

- 收藏作品
- 最近播放
- 播放进度
- 已听完状态
- 最近打开时间

### G. 主题

- 浅色
- 深色
- 跟随系统

V1 默认视觉主题为“纸张 + 夜读”。

---

# 5. 明确不做（V1）

以下内容不要在 V1 中实现：

- 用户注册体系
- 多用户社交
- 评论
- 私信
- 公开上传
- 会员
- 付费
- 广告
- 推荐算法
- AI 自动生成整站内容
- 在线直播
- 复杂音频编辑器
- 复杂后台 CMS
- App 原生端
- 微信登录

目标是先把核心“听 + 读 + 理解 + 氛围”体验打磨好。

---

# 6. 推荐技术架构

## 6.1 前端

建议：

- Next.js
- TypeScript
- App Router
- React
- Tailwind CSS
- ESLint
- Vitest
- Playwright

原则：

- 默认使用 Server Component 展示静态/内容数据。
- 只有播放器、搜索、筛选、收藏等交互区域使用 Client Component。
- 严格隔离内容层、播放层、存储层。
- UI 不直接依赖具体 TTS 服务商。

## 6.2 数据

V1 使用：

- SQLite
- Prisma ORM

原因：

- 自用项目部署简单。
- 单机/容器部署成本低。
- 后续可迁移 PostgreSQL。

静态文章正文也允许使用文件系统内容源。

推荐：

- 文章内容：Markdown / JSON
- 用户状态：SQLite
- 音频元数据：SQLite
- 音频文件：本地 storage 或对象存储

## 6.3 内容方案

推荐每篇文章使用独立 Markdown 文件 + YAML Front Matter。

示例：

```md
---
id: ji-cheng-tian-si-ye-you
title: 记承天寺夜游
authorId: su-shi
category: 古文
dynasty: 北宋
estimatedMinutes: 3
rightsStatus: public-domain
language: zh-CN
tags:
  - 月夜
  - 苏轼
  - 黄州
  - 散文小品
moods:
  - 夜读
  - 放松
ambience:
  - rain
  - night
---

## 原文

...

## 白话

...

## 创作背景

...

## 赏析

...
```

注释可放同文件结构化区域，也可使用独立 JSON。

---

# 7. TTS / 自然人声设计

## 7.1 核心原则

浏览器系统 SpeechSynthesis 只作为 fallback，不作为正式听书品质方案。

正式方案必须使用“预生成音频”。

原因：

- 声音稳定
- 每次播放一致
- 可缓存
- 可离线
- 容易控制语速、停顿、情绪
- 不依赖不同浏览器的系统音色

## 7.2 Provider 抽象

实现：

```ts
interface TTSProvider {
  synthesize(input: TTSRequest): Promise<TTSResult>;
}

type TTSRequest = {
  text: string;
  voice: string;
  rate?: number;
  pitch?: number;
  style?: string;
  format?: "mp3" | "wav";
};

type TTSResult = {
  audioUrl: string;
  durationMs?: number;
  provider: string;
  voice: string;
};
```

至少实现：

- `TencentTTSProvider`
- `BrowserSpeechFallback`

预留：

- `ManualAudioProvider`
- 其他云 TTS Provider

## 7.3 Secret 管理

TTS Secret 只能存在服务端环境变量。

绝对禁止：

- 浏览器直接持有 SecretKey
- 在前端源码中写 API Key
- 把凭据提交 Git

## 7.4 生成策略

不建议每次点击都现场合成。

采用：

“录入内容 → 服务端生成 → 存音频 → 用户直接播放”

流程：

1. 读取文章。
2. 清理用于朗读的文本。
3. 分成语义片段。
4. 添加停顿规则。
5. 调用 TTS。
6. 保存音频。
7. 保存元数据。
8. 前端读取已有音频。

## 7.5 朗读分段

推荐按照：

- 自然段
- 语义段
- 句号/问号/感叹号

切分。

每个播放 segment 建议尽量保持语义完整，不要机械地按固定字数截断。

示例：

```json
[
  {
    "id": "seg-001",
    "text": "元丰六年十月十二日夜，解衣欲睡，月色入户，欣然起行。",
    "audioUrl": "/audio/ji-cheng/001.mp3",
    "durationMs": 8400
  }
]
```

播放器播放到哪个 segment，就高亮哪个 segment。

V1 不要求逐字卡拉 OK 式高亮。

---

# 8. 古文朗读规则

古文不能简单按现代中文机械朗读。

需要实现可配置的朗读文本：

```ts
displayText
speechText
```

例：

```json
{
  "displayText": "水中藻、荇交横，盖竹柏影也。",
  "speechText": "水中藻、荇交横，盖竹柏影也。"
}
```

后续允许 speechText 加入：

- 停顿
- 生僻字读音
- 多音字纠正
- 人名地名读音
- 古诗节奏

每篇作品允许配置 `pronunciationOverrides`。

---

# 9. 音频播放器

## 9.1 播放状态

```ts
type PlayerState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error";
```

## 9.2 必须能力

- 播放/暂停
- Seek
- ±15 秒
- 上/下一 segment
- 倍速
- 进度显示
- 剩余时长
- 音量
- 错误恢复
- 自动预加载下一段
- 切换文章时安全释放音频
- 页面刷新后恢复进度

## 9.3 播放速度

V1：

- 0.8×
- 1.0×
- 1.2×
- 1.5×

默认 1.0×。

用户设置保存在本地。

---

# 10. 环境音引擎

使用独立 `<audio>` / Audio 层。

朗读音频与环境音必须解耦。

建议状态：

```ts
type AmbienceState = {
  enabled: boolean;
  scene: "rain" | "ocean" | "fire" | "night" | "wind" | null;
  volume: number;
};
```

默认环境音量：

```text
0.12 ~ 0.20
```

环境音：

- loop
- 低音量
- 淡入淡出
- 切换时 crossfade
- 不影响朗读暂停/继续

建议淡入淡出：

```text
500 ~ 1200 ms
```

---

# 11. 氛围场景

V1 不做重 3D。

采用轻量方案：

- 背景图
- CSS 微动画
- 少量 Canvas / SVG 动效
- 雨滴
- 光影
- 火焰
- 云层
- 月色

推荐场景：

### 雨夜书房

搭配：

- 古文
- 散文
- 志怪
- 推理

### 月夜庭院

搭配：

- 苏轼
- 古诗词
- 古文

### 江面月色

搭配：

- 春江花月夜
- 赤壁赋

### 篝火

搭配：

- 探险
- 恐怖
- 旅行
- 自传

V1 场景是辅助，不抢正文注意力。

---

# 12. 页面架构

路由建议：

```text
/
├── /library
├── /work/[slug]
├── /author/[slug]
├── /favorites
├── /history
└── /settings
```

内部管理路由：

```text
/admin
/admin/works
/admin/audio
```

V1 `/admin` 可以非常简陋，仅供本人使用。

---

# 13. 首页详细规格

首页结构：

```text
Header
│
├─ Logo / 名称
├─ 搜索
└─ 主题

Hero
│
├─ 今晚听什么
├─ 随机推荐
└─ 继续播放

最近收听

按心情
├─ 放松
├─ 夜读
├─ 刺激
├─ 古典
└─ 思考

按时间
├─ 5 min
├─ 10 min
├─ 20 min
└─ 30+ min

分类

精选作品
```

“继续播放”优先级最高。

---

# 14. 作品页详细规格

桌面布局：

```text
左：作品信息 / 章节
右：正文 / 注释 / 背景
底部或悬浮：播放器
```

移动布局：

```text
作品头部
正文
Tab
播放器
```

Tab：

- 原文
- 注释
- 白话
- 创作背景
- 作者
- 赏析

切 Tab 不应重置播放进度。

---

# 15. 作者页

字段：

- 姓名
- 生卒
- 朝代 / 国家
- 简介
- 生平时间线
- 文学风格
- 代表作品
- 本站收录
- 相关人物

示例：

```ts
type Author = {
  id: string;
  name: string;
  aliases?: string[];
  birthYear?: number;
  deathYear?: number;
  dynasty?: string;
  country?: string;
  bio: string;
  styleSummary?: string;
  timeline?: TimelineItem[];
};
```

---

# 16. 注释系统

注释必须可结构化。

```ts
type Annotation = {
  id: string;
  workId: string;
  segmentId?: string;
  term: string;
  explanation: string;
  pronunciation?: string;
  type:
    | "word"
    | "person"
    | "place"
    | "allusion"
    | "history"
    | "grammar";
};
```

前端支持：

- 正文点击词语弹注释
- “注释”Tab 汇总查看

V1 可以先只做 Tab 汇总。

---

# 17. 作品数据模型

建议 Prisma：

```prisma
model Work {
  id               String   @id
  slug             String   @unique
  title            String
  authorId         String?
  category         String
  dynasty          String?
  language         String   @default("zh-CN")
  summary          String?
  background       String?
  translation      String?
  appreciation     String?
  estimatedMinutes Int?
  rightsStatus     String
  sourceNote       String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  author           Author?  @relation(fields: [authorId], references: [id])
  segments         Segment[]
  audioAssets      AudioAsset[]
}

model Author {
  id        String @id
  slug      String @unique
  name      String
  bio       String?
  dynasty   String?
  birthYear Int?
  deathYear Int?

  works     Work[]
}

model Segment {
  id          String @id
  workId      String
  order       Int
  displayText String
  speechText  String?
  translation String?

  work        Work @relation(fields: [workId], references: [id])
}

model AudioAsset {
  id          String   @id
  workId      String
  segmentId   String?
  provider    String
  voice       String
  url         String
  durationMs  Int?
  checksum    String?
  createdAt   DateTime @default(now())

  work        Work @relation(fields: [workId], references: [id])
}

model PlaybackProgress {
  id          String   @id
  workId      String   @unique
  segmentId   String?
  positionMs  Int      @default(0)
  completed   Boolean  @default(false)
  updatedAt   DateTime @updatedAt
}

model Favorite {
  id        String   @id
  workId    String   @unique
  createdAt DateTime @default(now())
}
```

---

# 18. 版权字段

必须定义：

```ts
type RightsStatus =
  | "public-domain"
  | "licensed"
  | "user-owned"
  | "personal-reference"
  | "unknown";
```

规则：

- `unknown` 禁止公开发布。
- `personal-reference` 不进入未来公开内容库。
- 后台必须显示版权状态。
- 导入作品时版权字段为必填。
- 现代译本单独判断译者版权。
- 古文原文和现代注释/译文必须分开判断。

---

# 19. 搜索

搜索字段：

- 标题
- 作者
- 别名
- 分类
- 标签
- 朝代
- 简介

V1 可在服务端做简单 contains 搜索。

数据量增大后再增加全文检索。

不要在 V1 引入 Elasticsearch。

---

# 20. 本地状态

以下设置使用 localStorage 即可：

```text
theme
playbackRate
voicePreference
ambienceScene
ambienceVolume
autoPlayNext
sleepTimer
```

收藏、历史、播放进度建议入数据库，方便以后多端同步。

---

# 21. 睡眠定时

V1 建议直接做。

选项：

- 10 分钟
- 20 分钟
- 30 分钟
- 本篇结束

结束时：

- 停朗读
- 环境音 3～5 秒淡出

---

# 22. PWA

项目应支持 PWA 基础能力：

- 安装到桌面
- App 图标
- manifest
- 基础缓存

V1 不强求所有文章完全离线。

后续支持：

“下载本篇”

缓存：

- 文章
- 音频
- 封面

---

# 23. UI 设计规范

## 23.1 主基调

浅色：

- 宣纸
- 米白
- 暖灰
- 木色

深色：

- 墨黑
- 深棕
- 暖灰
- 暗金

强调色只能少量出现。

## 23.2 字体

正文优先：

```css
font-family:
  "Songti SC",
  "STSong",
  "Noto Serif SC",
  serif;
```

UI：

```css
-apple-system,
BlinkMacSystemFont,
"PingFang SC",
"Microsoft YaHei",
sans-serif;
```

## 23.3 正文

桌面：

```text
18px ~ 20px
line-height 1.9 ~ 2.1
```

手机：

```text
17px ~ 19px
line-height 1.8 ~ 2
```

正文最大阅读宽度：

```text
680 ~ 760 px
```

不要让长文本横跨整个大屏。

---

# 24. 响应式要求

最低宽度：

```text
320px
```

断点：

- 手机
- 平板
- 桌面

任何页面禁止出现整体横向滚动。

播放器按钮必须满足触控尺寸。

---

# 25. 可访问性

必须：

- button 用真实 `<button>`
- audio 控制有 aria-label
- Tab 支持键盘
- focus 可见
- 图标不作为唯一信息载体
- 对比度足够
- 动画遵循 prefers-reduced-motion

---

# 26. API

## GET `/api/works`

参数：

```text
category
author
q
duration
mood
page
```

## GET `/api/works/:slug`

返回完整作品。

## GET `/api/authors/:slug`

返回作者资料。

## POST `/api/progress`

```json
{
  "workId": "xxx",
  "segmentId": "seg-3",
  "positionMs": 2300,
  "completed": false
}
```

## POST `/api/favorites/:workId`

收藏。

## DELETE `/api/favorites/:workId`

取消收藏。

## POST `/api/admin/tts/generate`

仅本人使用。

输入：

```json
{
  "workId": "xxx",
  "voice": "xxx",
  "provider": "tencent"
}
```

输出生成任务信息。

---

# 27. TTS 后台任务

生成音频不能阻塞普通页面请求。

实现一个简单任务队列抽象：

```ts
type TTSJob = {
  id: string;
  workId: string;
  status: "queued" | "processing" | "done" | "failed";
  progress: number;
  error?: string;
};
```

V1 可以先使用数据库轮询。

不需要 Redis。

后续再升级队列系统。

---

# 28. 音频文件结构

本地：

```text
storage/
└── audio/
    └── ji-cheng-tian-si-ye-you/
        ├── seg-001.mp3
        ├── seg-002.mp3
        └── manifest.json
```

manifest：

```json
{
  "workId": "ji-cheng-tian-si-ye-you",
  "voice": "default-natural",
  "provider": "tencent",
  "segments": [
    {
      "id": "seg-001",
      "url": "/audio/.../seg-001.mp3",
      "durationMs": 8400
    }
  ]
}
```

---

# 29. 环境音资源

目录：

```text
public/
└── ambience/
    ├── rain-soft.mp3
    ├── ocean-night.mp3
    ├── fireplace.mp3
    ├── insects-night.mp3
    └── wind-soft.mp3
```

必须使用可合法使用的音频。

环境音应无明显旋律，防止与朗读抢注意力。

---

# 30. 种子内容

第一轮先做 10～20 篇。

建议至少完整做好：

1. 《记承天寺夜游》— 苏轼
2. 《前赤壁赋》— 苏轼
3. 《岳阳楼记》— 范仲淹
4. 《醉翁亭记》— 欧阳修
5. 《兰亭集序》— 王羲之
6. 《春江花月夜》— 张若虚
7. 《山居秋暝》— 王维
8. 《念奴娇·赤壁怀古》— 苏轼
9. 《聊斋志异》公版选篇
10. 古代公案/志怪短篇若干

先做少而精。

每一篇必须至少具备：

- 原文
- 作者
- 背景
- 注释
- 白话（古文）
- 标签
- 版权状态
- 朗读音频

---

# 31. 《记承天寺夜游》作为首个 Golden Sample

Codex 第一篇必须完整落地《记承天寺夜游》。

它承担：

- 页面样板
- 内容数据样板
- 注释样板
- TTS 样板
- 高亮样板
- 背景信息样板
- 作者页样板

项目不应在 Golden Sample 没有做好前批量导入内容。

---

# 32. 错误状态

必须处理：

### 音频加载失败

显示：

```text
音频暂时无法加载
[重新尝试]
```

### TTS 不存在

```text
本篇还没有生成自然朗读。
```

如果浏览器支持系统朗读：

```text
[使用系统朗读]
```

### 内容缺字段

Tab 禁用并显示：

```text
暂未整理
```

禁止：

- undefined
- NaN
- 空白页面
- 无限 loading

---

# 33. 日志

开发环境记录：

- API error
- audio load error
- TTS generate error
- content parse error

生产模式不输出 Secret 和完整凭据。

---

# 34. 性能要求

目标：

- 首页首屏尽量不加载大音频。
- 进入作品后再预加载当前音频。
- 当前 segment 播放时预加载下一 segment。
- 背景图必须压缩。
- 环境音资源控制大小。
- 列表图片 lazy load。

不要在首页预加载所有声音资源。

---

# 35. 测试

## 35.1 单元测试

至少覆盖：

- 内容 parser
- TTS 文本分段
- progress 状态
- duration 筛选
- rightsStatus 校验
- 搜索
- 播放器 reducer

## 35.2 E2E

Playwright 必测：

### Case 1

打开首页 → 搜索“苏轼” → 找到作品。

### Case 2

打开《记承天寺夜游》 → 原文显示。

### Case 3

切换“注释” → 注释出现。

### Case 4

切换“文章背景” → 正确出现。

### Case 5

播放 → 暂停 → 恢复。

### Case 6

切换环境音 → 雨声音量状态改变。

### Case 7

刷新页面 → 播放进度仍存在。

### Case 8

收藏 → 收藏页出现。

### Case 9

320px 手机宽度无横向溢出。

---

# 36. 环境变量

创建：

```text
.env.example
```

包括：

```env
DATABASE_URL="file:./dev.db"

TTS_PROVIDER="browser"

TENCENT_SECRET_ID=""
TENCENT_SECRET_KEY=""

AUDIO_STORAGE_DIR="./storage/audio"

ADMIN_TOKEN=""
```

`.env` 必须进 `.gitignore`。

---

# 37. Repository 结构

推荐：

```text
literature-listening-room/
├── app/
│   ├── page.tsx
│   ├── library/
│   ├── work/[slug]/
│   ├── author/[slug]/
│   ├── favorites/
│   ├── history/
│   ├── settings/
│   └── api/
├── components/
│   ├── player/
│   ├── ambience/
│   ├── reader/
│   ├── library/
│   └── ui/
├── content/
│   ├── works/
│   └── authors/
├── lib/
│   ├── content/
│   ├── player/
│   ├── tts/
│   ├── db/
│   └── rights/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── images/
│   └── ambience/
├── storage/
│   └── audio/
├── tests/
├── scripts/
│   ├── import-content.ts
│   └── generate-tts.ts
├── docs/
├── .env.example
├── README.md
└── package.json
```

---

# 38. 组件拆分

建议组件：

```text
AppHeader
SearchBar
CategoryTabs
MoodSelector
DurationSelector
WorkCard
ContinueListeningCard

ReaderHeader
ReaderTabs
OriginalText
AnnotationsPanel
TranslationPanel
BackgroundPanel
AuthorPanel

AudioPlayer
PlaybackControls
PlaybackRateSelector
VoiceSelector
SleepTimer

AmbienceController
AmbienceVolume
SceneBackground

FavoriteButton
ProgressIndicator
```

播放器相关逻辑不要散落在页面组件。

---

# 39. Store

V1 推荐 React Context + reducer。

避免一开始引入复杂状态库。

```ts
type PlayerStore = {
  workId: string | null;
  segmentIndex: number;
  status: PlayerState;
  currentTime: number;
  duration: number;
  rate: number;
  volume: number;
};
```

如果后续状态明显复杂再换 Zustand 等方案。

---

# 40. 内容录入流程

推荐：

```text
新增 Markdown
↓
npm run content:validate
↓
内容校验
↓
导入数据库
↓
生成 TTS
↓
检查音频
↓
完成
```

创建命令：

```text
npm run content:validate
npm run content:import
npm run tts:generate -- --work=ji-cheng-tian-si-ye-you
```

具体 CLI 实现由 Codex 完成。

---

# 41. 内容校验

校验规则：

必须存在：

- id
- slug
- title
- category
- rightsStatus
- 原文

古文：

必须推荐存在：

- 注释
- 白话
- 背景

如果：

```text
rightsStatus = unknown
```

则 validator warning。

未来公开模式：

直接 error。

---

# 42. 数据安全

因为首版自用：

- 不收集第三方用户信息。
- 不接第三方登录。
- `/admin` 使用简单 token 或 Basic Auth 保护。
- TTS 凭据仅服务端。
- 数据库不要暴露。
- API 对写操作做基本鉴权。

---

# 43. 未来微信小程序兼容策略

Web V1 从第一天就做到：

### 内容层独立

作品 JSON/Markdown 与 UI 解耦。

### API 层独立

页面不直接访问 Prisma。

统一通过 repository/service。

### Player 数据结构独立

未来微信小程序可以复用：

- Work
- Segment
- Annotation
- Author
- AudioManifest

未来小程序只重做 UI 和播放器实现。

不要把核心业务全部写死在 Next.js page 中。

---

# 44. 后续功能（V2+）

优先顺序：

## V2

- 睡眠定时
- PWA 下载
- 更多氛围
- “今晚听什么”
- 随机播放
- 全文搜索
- 作者关系

## V3

- 私人笔记
- 高亮
- 书签
- 自己导入文章
- EPUB / TXT 导入
- 自动生成朗读

## V4

- AI 辅助：
  - 解释古文
  - 背景问答
  - 人物关系
  - 文本赏析
- 但 AI 内容必须明显标注，不能与原文、人工注释混在一起。

## V5

- 微信小程序客户端
- 多端播放进度同步

---

# 45. Codex 实现顺序

Codex 不要一次性把所有功能乱铺开。

严格按照：

## Phase 1：脚手架

完成：

- Next.js
- TypeScript
- Tailwind
- ESLint
- Vitest
- Playwright
- Prisma
- SQLite

验收：

```text
npm run dev
npm run lint
npm run test
npm run build
```

全部通过。

---

## Phase 2：内容系统

完成：

- Work schema
- Author schema
- Markdown parser
- Seed data
- 《记承天寺夜游》

验收：

浏览器可打开作品详情。

---

## Phase 3：阅读体验

完成：

- 原文
- 注释
- 白话
- 背景
- 作者介绍
- Tab
- 响应式

验收：

手机与桌面均可使用。

---

## Phase 4：音频

完成：

- AudioPlayer
- Browser Speech fallback
- TTSProvider interface
- 手动音频资源模式

先用本地测试音频，不要求立即接云。

---

## Phase 5：云 TTS

完成：

- TencentTTSProvider
- 服务端 Secret
- 生成脚本
- audio manifest
- segment audio

验收：

《记承天寺夜游》可用自然 TTS 完整播放。

---

## Phase 6：同步高亮

播放器：

```text
segment 0 → 高亮第1段
segment 1 → 高亮第2段
```

点击段落：

跳转播放该段。

---

## Phase 7：氛围音

完成：

- 雨
- 海浪
- 篝火
- 夜虫
- 风

独立音量。

---

## Phase 8：个人数据

完成：

- 收藏
- 最近听
- 进度
- 已完成
- 设置

---

## Phase 9：完整测试

完成：

- Unit
- E2E
- 手机
- 桌面
- Safari
- Chrome

---

# 46. Definition of Done

项目 V1 只有满足以下条件才算完成：

- [ ] `npm install` 后可运行。
- [ ] `.env.example` 完整。
- [ ] README 能让新机器从零启动。
- [ ] 首页完成。
- [ ] 书架完成。
- [ ] 搜索完成。
- [ ] 分类完成。
- [ ] 《记承天寺夜游》完整数据完成。
- [ ] 作者介绍完成。
- [ ] 创作背景完成。
- [ ] 注释完成。
- [ ] 白话完成。
- [ ] 自然朗读完成。
- [ ] 音频播放稳定。
- [ ] 播放器段落高亮完成。
- [ ] 雨声等环境音完成。
- [ ] 收藏完成。
- [ ] 历史完成。
- [ ] 播放进度恢复完成。
- [ ] 深色模式完成。
- [ ] 手机适配完成。
- [ ] 不出现横向溢出。
- [ ] 所有主要交互键盘可操作。
- [ ] Lint 通过。
- [ ] Unit Test 通过。
- [ ] Playwright 通过。
- [ ] Production build 通过。
- [ ] 不存在 Secret 泄漏。
- [ ] Seed 内容版权状态明确。

---

# 47. Codex 编码要求

Codex 必须遵守：

1. TypeScript strict。
2. 不允许无理由使用 `any`。
3. 不把所有逻辑堆到单页面。
4. Player 必须单独模块。
5. TTS 必须 provider abstraction。
6. 数据库必须有 migration。
7. 所有环境变量进 `.env.example`。
8. Secret 不进客户端。
9. 每个 Phase 完成后跑：
   - lint
   - test
   - build
10. 遇到不确定需求优先：
   - 保持简单
   - 不过度设计
   - 不做 V1 范围外功能
11. 不自动抓取受版权保护的网站内容。
12. 不使用未经说明来源的文章批量填充数据库。

---

# 48. Codex 最终交付物

最终 repository 至少包含：

- 可运行源码
- 数据库 schema
- migration
- seed
- 测试
- README
- `.env.example`
- 示例文章
- TTS 接入说明
- 内容导入说明
- 版权字段说明
- 音频生成脚本
- Dockerfile（推荐）
- `docker-compose.yml`（如果采用单机部署）

---

# 49. Codex 主任务 Prompt

下面内容可以直接作为 Codex 主任务：

---

你需要实现一个名为“私人文学听读馆”的完整 Web 应用。

这是一个个人自用优先的沉浸式文学听读产品。核心体验是：

“自然人声朗读 + 原文阅读 + 注释 + 白话 + 创作背景 + 作者介绍 + 轻环境声音”。

请严格按照本规格说明书开发。

首个 Golden Sample 必须是《记承天寺夜游》。

技术栈使用 Next.js + TypeScript + Tailwind + Prisma + SQLite。

架构必须做到：

- 内容层与 UI 解耦
- Player 独立
- TTS Provider 独立
- 服务端 Secret
- 支持未来微信小程序客户端复用内容/API
- 响应式
- 深浅色
- 可测试

正式高质量朗读不得依赖浏览器 SpeechSynthesis；SpeechSynthesis 只作为 fallback。

高质量朗读使用服务端 TTS 生成并缓存的音频资源。

第一阶段可以使用本地示例音频，把完整播放链路做通；再实现云 TTS Provider。

不要一开始批量导入大量作品。

先把《记承天寺夜游》做到完整，包括：

- 原文
- 注释
- 白话
- 创作背景
- 作者介绍
- 朗读
- 播放高亮
- 环境音
- 收藏
- 播放进度

请按 Phase 逐步实现。

每个阶段完成后必须执行：

```bash
npm run lint
npm run test
npm run build
```

如果失败，先修复，再进入下一阶段。

最终请输出：

1. 完整项目。
2. README。
3. 数据结构说明。
4. 内容导入说明。
5. TTS 配置说明。
6. 测试结果。
7. 当前限制。
8. 后续建议。

不要擅自扩展会员、社交、登录、支付或推荐算法。

优先确保核心体验稳定、舒服、简单、易维护。

---

# 50. 最终产品体验验收描述

用户晚上打开网页。

首页出现：

> 今晚，听一篇好文章。

用户点击：

> 《记承天寺夜游》

页面出现月夜风格背景。

可以：

- 点“开始朗读”
- 听自然中文声音
- 正文跟随当前段落高亮
- 开启轻雨声
- 调低雨声音量
- 查看“欣然”“空明”“闲人”等注释
- 切换白话
- 查看苏轼简介
- 查看黄州时期创作背景
- 收藏
- 退出

第二天回来：

应用记住上次进度。

这就是 V1 的核心完成状态。

---

# 51. 技术接入备注

1. Next.js 使用 App Router。
2. TTS 实现必须可替换。
3. 腾讯云 TTS 可作为首个高品质中文云端 Provider。
4. 长篇内容优先使用异步/长文本生成能力，或按语义 segment 分段生成。
5. 使用 SSML/服务商支持的停顿能力优化古文朗读节奏。
6. 云服务实际接口、模型名、费用与限制必须在接入时读取最新官方文档，不要把易变化参数硬编码进业务逻辑。
7. 浏览器原生朗读只作为兼容 fallback。

---

**文档结束。**
