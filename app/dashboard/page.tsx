import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, BarChart3, TrendingDown, FileText, Tag, Target, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold">
              MoneyPath
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost">
                  ログアウト
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

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

        {/* アクションカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/transactions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-xl">収支を記録する</CardTitle>
                <CardDescription>
                  毎月の収入と支出を記録して、お金の流れを把握しましょう。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  家計簿を入力 →
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/categories">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-xl">カテゴリーを管理</CardTitle>
                <CardDescription>
                  支出や収入のカテゴリーを自分好みにカスタマイズしましょう。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  カテゴリー管理 →
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* クイックリンク */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/transactions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center p-6">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-semibold">
                家計簿入力
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/categories">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center p-6">
              <Tag className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-semibold">
                カテゴリー管理
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center p-6">
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

        {/* 機能紹介 */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl">これから使える機能</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">
                    収支・負債管理
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    現在の収入、支出、負債を一元管理
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">
                    目標達成ロードマップ
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    借金完済や貯金目標達成までの道筋を可視化
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">
                    進捗グラフ表示
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    月々の進捗を視覚的に確認
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">
                    What-ifシミュレーション
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    様々なシナリオでの未来を予測
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
