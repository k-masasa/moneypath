"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, BarChart3, TrendingDown, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/components/loading-provider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DashboardClientProps {
  userEmail: string;
}

type MonthlyStats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
};

type CategoryStat = {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  categoryIcon?: string;
  totalAmount: number;
  count: number;
};

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const { startLoading, stopLoading } = useLoading();
  const [stats, setStats] = useState<MonthlyStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 現在の年月を初期値に
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    fetchMonthlyStats();
  }, [selectedYear, selectedMonth]);

  const fetchMonthlyStats = async () => {
    if (!isInitialLoad) {
      startLoading();
    }
    try {
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

      const response = await fetch(
        `/api/analytics?startDate=${startOfMonth.toISOString().split("T")[0]}&endDate=${endOfMonth.toISOString().split("T")[0]}`
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.summary);
        setCategoryStats(data.categoryStats || []);
      }
    } catch (error) {
      console.error("Failed to fetch monthly stats:", error);
    } finally {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      } else {
        stopLoading();
      }
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

  const handleCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const selectedMonthLabel = `${selectedYear}年${selectedMonth}月`;

  // 収入と支出のカテゴリーを分離
  const incomeCategories = categoryStats.filter(stat => stat.categoryType === "income");
  const expenseCategories = categoryStats.filter(stat => stat.categoryType === "expense");

  // 1%未満のカテゴリーを「その他」にまとめる
  const prepareChartData = (categories: CategoryStat[], total: number) => {
    const significantCategories: CategoryStat[] = [];
    const smallCategories: CategoryStat[] = [];

    categories.forEach(category => {
      const percentage = (category.totalAmount / total) * 100;
      if (percentage >= 1) {
        significantCategories.push(category);
      } else {
        smallCategories.push(category);
      }
    });

    // 「その他」カテゴリーを作成
    if (smallCategories.length > 0) {
      const othersTotal = smallCategories.reduce((sum, cat) => sum + cat.totalAmount, 0);
      const othersCount = smallCategories.reduce((sum, cat) => sum + cat.count, 0);
      significantCategories.push({
        categoryId: 'others',
        categoryName: 'その他',
        categoryType: 'expense',
        totalAmount: othersTotal,
        count: othersCount,
      });
    }

    return significantCategories;
  };

  const chartExpenseCategories = prepareChartData(expenseCategories, stats.totalExpense);

  // 円グラフ用のカラーパレット（グレースケール）
  const COLORS = ['#2d2d2d', '#4a4a4a', '#6b6b6b', '#8c8c8c', '#adadad', '#cecece', '#efefef'];

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader userEmail={userEmail} />
        <DashboardSidebar />
        <div className="pt-24 pl-64 container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <Wallet className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={userEmail} />
      <DashboardSidebar />

      <div className="pt-24 pl-64 container mx-auto px-4 py-8">
        {/* クイック統計 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedMonthLabel}の収支</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {!isCurrentMonth() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCurrentMonth}
                    className="cursor-pointer"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    今月
                  </Button>
                )}
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
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span>収入</span>
                </div>
                <div className="text-xl font-bold">
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
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span>支出</span>
                </div>
                <div className="text-xl font-bold">
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
                  <span>残金</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(stats.balance)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* 支出の内訳 */}
        {expenseCategories.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* 円グラフ */}
                <div className="w-full h-[800px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartExpenseCategories}
                        dataKey="totalAmount"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        outerRadius={280}
                        label={(entry: any) => `${entry.categoryName} (${((entry.totalAmount / stats.totalExpense) * 100).toFixed(0)}%)`}
                      >
                        {chartExpenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* カテゴリーリスト */}
                <div className="space-y-2">
                  {expenseCategories.map((category, index) => (
                    <div key={category.categoryId} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{category.categoryName}</span>
                        <span className="text-xs text-muted-foreground">({category.count}件)</span>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(category.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
