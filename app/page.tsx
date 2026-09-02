import Link from "next/link";
import { LIBRARY_CATEGORIES } from "@/components/library/library-options";
import { getCategoryCountsSync } from "@/lib/content/category-counts";
const moods = ["放松", "夜读", "来点刺激", "想点事情", "古典"];
const durations = [
  { label: "5 分钟", value: "5" },
  { label: "10 分钟", value: "10" },
  { label: "20 分钟", value: "20" },
  { label: "30 分钟+", value: "30%2B" },
];

export default function Home() {
  const categoryCounts = getCategoryCountsSync(LIBRARY_CATEGORIES);

  return (
    <main>
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">今夜精选 · 月色与闲心</p>
          <h1>今晚，听一篇好文章。</h1>
          <p className="hero-intro">
            自然人声、原文与注释并肩而行。不追赶信息，只留一小段时间，认真听完一篇文章。
          </p>
          <form action="/library" className="home-search" method="get" role="search">
            <label className="sr-only" htmlFor="home-search-input">
              搜索作品、作者或标签
            </label>
            <input
              id="home-search-input"
              name="q"
              placeholder="搜作品、作者或标签"
              type="search"
            />
            <button type="submit">搜索书架</button>
          </form>
          <Link className="import-entry" href="/import">导入我的电子书 <span aria-hidden="true">→</span></Link>
        </div>

        <article className="tonight-pick" aria-labelledby="tonight-title">
          <p>手工精选，非算法推荐</p>
          <h2 id="tonight-title" className="font-serif">记承天寺夜游</h2>
          <p className="tonight-meta">苏轼 · 北宋 · 古文 · 约 2 分钟</p>
          <blockquote>“庭下如积水空明，水中藻、荇交横，盖竹柏影也。”</blockquote>
          <Link className="primary-action" href="/work/ji-cheng-tian-si-ye-you">
            进入月夜
          </Link>
        </article>
      </section>

      <div className="home-content">
        <section className="home-section" aria-labelledby="continue-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">最近收听</p>
              <h2 id="continue-title">从上次停下的地方继续</h2>
            </div>
            <Link href="/history">查看播放记录</Link>
          </div>
          <div className="quiet-empty">
            <p>还没有播放记录。</p>
            <span>开始听一篇后，进度会安静地留在这里。</span>
          </div>
        </section>

        <section className="home-section browse-grid" aria-label="浏览入口">
          <div>
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">按心情</p>
                <h2>今晚想怎样待一会儿？</h2>
              </div>
            </div>
            <div className="filter-links">
              {moods.map((mood) => (
                <Link href={`/library?mood=${encodeURIComponent(mood)}`} key={mood}>
                  {mood}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">按时长</p>
                <h2>给自己留多少时间？</h2>
              </div>
            </div>
            <div className="filter-links">
              {durations.map((duration) => (
                <Link href={`/library?duration=${duration.value}`} key={duration.value}>
                  {duration.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section" aria-labelledby="categories-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">分类书架</p>
              <h2 id="categories-title">从熟悉的文字开始</h2>
            </div>
            <Link href="/library">查看全部</Link>
          </div>
          <nav aria-label="作品分类" className="category-list">
            {LIBRARY_CATEGORIES.map((category) => (
              <Link href={`/library?category=${encodeURIComponent(category)}`} key={category}>
                <span className="font-serif">{category}</span>
                <small>{categoryCounts[category] ?? 0} 篇已整理</small>
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </main>
  );
}
