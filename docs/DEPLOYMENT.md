# 单机 Docker 与 Google Cloud Run 部署

## 单机运行

复制 `.env.docker.example` 为 `.env.docker`，设置一个仅自己知道的 `ADMIN_TOKEN`，然后执行：

```bash
docker compose up --build
```

电脑访问 `http://localhost:3000`，同一局域网手机访问运行电脑的局域网 IP 加 `:3000`。

容器会在首次启动时执行 Prisma migration 和内容 seed；SQLite 数据保存在名为
`literature-room-data` 的 Docker volume 中。

## Google Cloud Run

Cloud Run 官方支持从源代码部署 Next.js 服务。建议先在本地完成 Docker 验证，再执行：

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud run deploy literature-room \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars ADMIN_TOKEN=YOUR_PRIVATE_TOKEN
```

`ADMIN_TOKEN` 不要写入 GitHub、Dockerfile 或提交记录。Cloud Run 实例的本地文件系统不是长期持久盘，
因此当前 SQLite 中的收藏、进度适合个人试用，不应视为可靠备份；若要长期保存，需要迁移到持久化数据库。
音频和文章内容随镜像发布，不依赖本机隧道。

## GitHub

建议使用 GitHub 私有仓库存放源码。GitHub Pages 只能托管静态文件，不能运行本项目的 Next.js 服务端、
Prisma、SQLite、收藏/进度 API 和电子书导入；完整版本应使用 Cloud Run 或自有服务器。
