import { auth } from "@/auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロフィール",
};

export default async function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const session = (await auth()) as Session | null;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={session.user.email ?? ""} />
      <DashboardSidebar />

      <main className="ml-64 mt-[73px] p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">プロフィール</h1>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">メールアドレス</p>
                <p className="text-base font-medium">{session.user.email}</p>
              </div>
              {session.user.name && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ユーザー名</p>
                  <p className="text-base font-medium">{session.user.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
