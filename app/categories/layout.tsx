import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "カテゴリー管理",
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
