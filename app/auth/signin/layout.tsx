import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
