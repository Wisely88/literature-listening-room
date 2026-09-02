import type { Metadata, Viewport } from "next";
import { AppHeader } from "@/components/ui/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "私人文学听读馆",
    template: "%s｜私人文学听读馆",
  },
  description: "自然朗读、原文阅读与轻环境声组成的私人文学空间。",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#171511" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem("literature-theme")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";document.documentElement.dataset.theme=d;document.documentElement.dataset.themePreference=p}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
