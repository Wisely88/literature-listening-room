import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

export function AppHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand-link" href="/" aria-label="私人文学听读馆首页">
          <span aria-hidden="true" className="brand-mark">
            文
          </span>
          <span className="brand-name">私人文学听读馆</span>
        </Link>
        <nav aria-label="主导航" className="primary-nav">
          <Link href="/">首页</Link>
          <Link href="/library">书架</Link>
          <Link href="/history">最近</Link>
          <Link href="/favorites">收藏</Link>
          <Link href="/import">导入</Link>
        </nav>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
