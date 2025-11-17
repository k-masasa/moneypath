"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { useSession } from "next-auth/react";
import { useLoading } from "@/components/loading-provider";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();

  const [initialBalance, setInitialBalance] = useState("");
  const [balanceStartDate, setBalanceStartDate] = useState("");
  const [hasExistingBalance, setHasExistingBalance] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/user/balance");
      if (response.ok) {
        const data = await response.json();
        if (data.hasBalance) {
          setInitialBalance(data.initialBalance.toString());
          setBalanceStartDate(new Date(data.balanceStartDate).toISOString().split("T")[0]);
          setHasExistingBalance(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!initialBalance || !balanceStartDate) {
      toast({
        title: "入力エラー",
        description: "初期残高と開始日を入力してください",
        variant: "destructive",
      });
      return;
    }

    startLoading();
    try {
      const response = await fetch("/api/user/balance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialBalance: parseFloat(initialBalance),
          balanceStartDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to save balance");

      toast({
        title: "✅ 保存しました",
        description: "初期残高を設定しました",
      });

      setHasExistingBalance(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "エラー",
        description: "保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={session?.user?.email || ""} />
      <DashboardSidebar />

      <div className="pt-32 pl-64 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>初期残高設定</CardTitle>
            <CardDescription>
              記録を開始した時点の残高を設定してください。ここから現在の資産を計算します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">開始日</label>
                <Input
                  type="date"
                  value={balanceStartDate}
                  onChange={(e) => setBalanceStartDate(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  記録を開始した日付（例: 2025-11-01）
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">初期残高（円）</label>
                <Input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="300000"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  開始日時点で持っていた金額
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {hasExistingBalance ? "更新する" : "設定する"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
