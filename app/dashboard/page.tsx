import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import type { Session } from "next-auth";

export default async function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const session = (await auth()) as Session | null;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <DashboardClient userEmail={session.user.email || ""} />;
}
