import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AmbienceController } from "@/components/ambience/ambience-controller";
import { FavoriteButton } from "@/components/library/favorite-button";
import { ReadingRoom } from "@/components/reader/reading-room";
import { getWorkBySlug } from "@/lib/content/repository";
import { getProgress, isFavorite } from "@/lib/library/personal-data";
import type { InitialProgress } from "@/lib/player";
import { loadAudioManifests } from "@/lib/tts/server/manifest-loader";
import type { AudioManifest } from "@/lib/tts";
import styles from "./page.module.css";

const rightsLabels: Record<string, string> = {
  "public-domain": "公版作品",
  licensed: "已获授权",
  "user-owned": "用户自有",
  "personal-reference": "仅供个人参考",
  unknown: "版权待确认",
};

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  const authorName = work.author?.name ?? "佚名";
  const rightsLabel = rightsLabels[work.rightsStatus] ?? work.rightsStatus;
  let manifests: AudioManifest[] = [];
  try {
    manifests = await loadAudioManifests(work.id, {
      storageRoot: path.join(process.cwd(), "public", "audio"),
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const manifest = manifests[0] ?? null
  // Reading remains available even when the optional local progress database is
  // temporarily unavailable (for example during a native-driver restart).
  let favorited = false;
  let progress: Awaited<ReturnType<typeof getProgress>> = null;
  try {
    [favorited, progress] = await Promise.all([isFavorite(work.id), getProgress(work.id)]);
  } catch {
    // Keep the reader usable; the next interaction can retry persistence.
  }
  const initialProgress: InitialProgress | null = progress
    ? {
        segmentId: progress.segmentId,
        positionMs: progress.positionMs,
        completed: progress.completed,
      }
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link className={styles.backLink} href="/">
          ← 返回听读馆
        </Link>

        <article>
          <header className={styles.workHeader}>
            <p className={styles.eyebrow}>
              {work.category}
              {work.moods[0] ? ` · ${work.moods[0]}` : ""}
            </p>
            <h1 className={styles.title}>{work.title}</h1>
            <p className={styles.byline}>
              {work.author ? (
                <Link href={`/author/${work.author.slug}`}>{authorName}</Link>
              ) : (
                authorName
              )}
              {work.dynasty ? ` · ${work.dynasty}` : ""}
            </p>
            {work.summary ? <p className={styles.summary}>{work.summary}</p> : null}
          </header>

          <div className={styles.contentGrid}>
            <aside aria-labelledby="work-info-title" className={styles.workInfo}>
              <h2 className={styles.infoTitle} id="work-info-title">
                作品信息
              </h2>
              <dl className={styles.metaList}>
                <div className={styles.metaItem}>
                  <dt>作者</dt>
                  <dd>{authorName}</dd>
                </div>
                <div className={styles.metaItem}>
                  <dt>朝代</dt>
                  <dd>{work.dynasty || "暂未整理"}</dd>
                </div>
                <div className={styles.metaItem}>
                  <dt>类型</dt>
                  <dd>{work.category || "暂未整理"}</dd>
                </div>
                <div className={styles.metaItem}>
                  <dt>预计朗读</dt>
                  <dd>
                    {work.estimatedMinutes ? `${work.estimatedMinutes} 分钟` : "暂未整理"}
                  </dd>
                </div>
                <div className={styles.metaItem}>
                  <dt>版权</dt>
                  <dd>{rightsLabel}</dd>
                </div>
              </dl>
              <div className={styles.favoriteSlot}>
                <FavoriteButton initialFavorited={favorited} workId={work.id} />
              </div>
              {work.sourceNote ? <p className={styles.sourceNote}>{work.sourceNote}</p> : null}
            </aside>

            <div className={styles.readerColumn}>
              <ReadingRoom
                initialProgress={initialProgress}
                manifest={manifest}
                manifests={manifests}
                work={work}
              />
              <div className={styles.ambienceSlot}>
                <AmbienceController defaultScene={work.defaultAmbience} />
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
