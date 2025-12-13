import type { Metadata } from "next";
import "./globals.css";
import { LoadingProvider } from "@/components/loading-provider";
import { SessionProvider } from "@/components/session-provider";
import { TransactionDialogProvider } from "@/components/transaction-dialog-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "MoneyPath",
  description: "シンプルな収支管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <SessionProvider>
          <LoadingProvider>
            <TransactionDialogProvider>
              {children}
              <Toaster />
            </TransactionDialogProvider>
          </LoadingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
