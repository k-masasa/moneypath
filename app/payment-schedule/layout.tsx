import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "支払い予定",
};

export default function PaymentScheduleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
