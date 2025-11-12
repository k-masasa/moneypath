import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Map, BarChart3, Layers, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">MoneyPath</h1>
            <div className="space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">ログイン</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>新規登録</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            お金の道筋を
            <br />
            <span className="text-primary">可視化する</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            借金返済や目標貯金額達成までのロードマップを視覚的に表示。
            明るい将来が見えるお金管理アプリ。
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">今すぐ始める</Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">詳しく見る</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 主要機能 */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">主要機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>収支管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  現在の収入・支出・負債を簡単に入力して一元管理。シンプルで直感的な操作性。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>目標設定</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  借金完済日や貯金目標額を設定。達成までの期間を逆算して計算。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Map className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>ロードマップ生成</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  目標達成までの道筋を自動で可視化。未来への道が見える。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>進捗管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  月々の必要ペースと進捗をグラフで表示。視覚的に進捗を確認。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Layers className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>シミュレーション</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  節約したら？収入が増えたら？様々なシナリオをシミュレーション。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>シンプルなUI</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  希望が見えるデザイン。お金の不安を前向きなエネルギーに変換。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto bg-primary text-primary-foreground">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">
              今日からあなたのお金の道筋を描こう
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-xl">
              無料で始められます。クレジットカード不要。
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                無料で始める
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* フッター */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MoneyPath. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
