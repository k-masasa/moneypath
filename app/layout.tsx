import type { Metadata } from "next";
import "./globals.css";
import { LoadingProvider } from "@/components/loading-provider";

export const metadata: Metadata = {
  title: "MoneyPath - お金の道筋を可視化する",
  description: "明るい将来が見えるお金管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
