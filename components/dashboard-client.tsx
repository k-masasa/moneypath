"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, BarChart3, TrendingDown, FileText, Tag, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/components/loading-provider";

interface DashboardClientProps {
  userEmail: string;
}

type MonthlyStats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
};

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const { startLoading, stopLoading } = useLoading();
  const [stats, setStats] = useState<MonthlyStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });

  // 現在の年月を初期値に
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    fetchMonthlyStats();
  }, [selectedYear, selectedMonth]);

  const fetchMonthlyStats = async () => {
    startLoading();
    try {
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

      const response = await fetch(
        `/api/analytics?startDate=${startOfMonth.toISOString().split("T")[0]}&endDate=${endOfMonth.toISOString().split("T")[0]}`
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch monthly stats:", error);
    } finally {
      stopLoading();
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const selectedMonthLabel = `${selectedYear}年${selectedMonth}月`;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader userEmail={userEmail} />

      <div className="container mx-auto px-4 py-8">
        {/* ウェルカムセクション */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            ようこそ、{userEmail}さん
          </h1>
          <p className="text-muted-foreground">
            あなたのお金の道筋を管理しましょう
          </p>
        </div>

        {/* クイック統計 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedMonthLabel}の収支</CardTitle>
                <CardDescription>収入と支出の概要</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 収入 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>収入</span>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                  {formatCurrency(stats.totalIncome)}
                </div>
                {stats.totalIncome === 0 && (
                  <p className="text-xs text-muted-foreground">
                    収入データを追加してください
                  </p>
                )}
              </div>

              {/* 支出 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>支出</span>
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-500">
                  {formatCurrency(stats.totalExpense)}
                </div>
                {stats.totalExpense === 0 && (
                  <p className="text-xs text-muted-foreground">
                    支出データを追加してください
                  </p>
                )}
              </div>

              {/* 収支 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingDown className="h-4 w-4" />
                  <span>収支</span>
                </div>
                <div className={`text-3xl font-bold ${
                  stats.balance >= 0
                    ? "text-green-600 dark:text-green-500"
                    : "text-red-600 dark:text-red-500"
                }`}>
                  {formatCurrency(stats.balance)}
                </div>
                {stats.balance >= 0 ? (
                  <p className="text-xs text-muted-foreground">
                    順調です
                  </p>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-500">
                    収入を超えています
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
