import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, BarChart3, TrendingDown, FileText, Tag, Target } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader userEmail={session.user.email || ""} />

      <div className="container mx-auto px-4 py-8">
        {/* ウェルカムセクション */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            ようこそ、{session.user.name || session.user.email}さん
          </h1>
          <p className="text-muted-foreground">
            あなたのお金の道筋を管理しましょう
          </p>
        </div>

        {/* クイック統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                月収入
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥0</div>
              <p className="text-xs text-muted-foreground mt-1">
                収入データを追加してください
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                月支出
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥0</div>
              <p className="text-xs text-muted-foreground mt-1">
                支出データを追加してください
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                総負債
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥0</div>
              <p className="text-xs text-muted-foreground mt-1">
                負債データを追加してください
              </p>
            </CardContent>
          </Card>
        </div>

        {/* クイックリンク */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/transactions" className="cursor-pointer">
            <Card className="hover:shadow-lg transition-shadow text-center p-6">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-semibold">
                家計簿入力
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/categories" className="cursor-pointer">
            <Card className="hover:shadow-lg transition-shadow text-center p-6">
              <Tag className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-semibold">
                カテゴリー管理
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/analytics" className="cursor-pointer">
            <Card className="hover:shadow-lg transition-shadow text-center p-6">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-semibold">
                分析・グラフ
              </div>
            </Card>
          </Link>

          <Card className="opacity-50 text-center p-6 cursor-not-allowed">
            <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <div className="font-semibold text-muted-foreground">
              目標設定（準備中）
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
