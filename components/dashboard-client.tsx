"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, BarChart3, TrendingDown, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/components/loading-provider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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

type MonthlyTrend = {
  year: number;
  month: number;
  label: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
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
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 現在の年月を初期値に
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  // 12ヶ月トレンドグラフの開始年月（デフォルトは現在月）
  const [trendStartYear, setTrendStartYear] = useState(now.getFullYear());
  const [trendStartMonth, setTrendStartMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    fetchMonthlyStats();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchMonthlyTrends();
  }, [trendStartYear, trendStartMonth]);

  const fetchMonthlyStats = async () => {
    if (!isInitialLoad) {
      startLoading();
    }
    try {
      // その月の1日から月末までを取得
      const endOfMonth = new Date(selectedYear, selectedMonth, 0); // 次の月の0日 = 今月の最終日

      // ISO形式で日付のみを取得（YYYY-MM-DD）
      const startDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;

      const response = await fetch(
        `/api/analytics?startDate=${startDateStr}&endDate=${endDateStr}`
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

  const fetchMonthlyTrends = async () => {
    try {
      const trends: MonthlyTrend[] = [];

      // 過去12ヶ月分のデータを取得（trendStartMonthから11ヶ月前まで）
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(trendStartYear, trendStartMonth - 1 - i, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1;

        // その月の1日から月末までを取得
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0); // 次の月の0日 = 今月の最終日

        // ISO形式で日付のみを取得（YYYY-MM-DD）
        const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;

        const response = await fetch(
          `/api/analytics?startDate=${startDateStr}&endDate=${endDateStr}`
        );

        if (response.ok) {
          const data = await response.json();
          // データがある月だけ追加（transactionCountが0より大きい）
          if (data.summary.transactionCount > 0) {
            trends.push({
              year,
              month,
              label: `${year}/${month}`,
              totalIncome: data.summary.totalIncome,
              totalExpense: data.summary.totalExpense,
              balance: data.summary.balance,
            });
          }
        }
      }

      setMonthlyTrends(trends);
    } catch (error) {
      console.error("Failed to fetch monthly trends:", error);
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

  const handlePreviousTrendPeriod = () => {
    if (trendStartMonth === 1) {
      setTrendStartMonth(12);
      setTrendStartYear(trendStartYear - 1);
    } else {
      setTrendStartMonth(trendStartMonth - 1);
    }
  };

  const handleNextTrendPeriod = () => {
    if (trendStartMonth === 12) {
      setTrendStartMonth(1);
      setTrendStartYear(trendStartYear + 1);
    } else {
      setTrendStartMonth(trendStartMonth + 1);
    }
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
        {/* 12ヶ月トレンドグラフ */}
        {monthlyTrends.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousTrendPeriod}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextTrendPeriod}
                  className="cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="label"
                      stroke="#666"
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#666"
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                      ticks={(() => {
                        // データの最大値を取得
                        const maxValue = Math.max(
                          ...monthlyTrends.map(t => Math.max(t.totalIncome, t.totalExpense)),
                          0
                        );
                        // 10万円刻みで刻み目を生成
                        const step = 100000;
                        const maxTick = Math.ceil(maxValue / step) * step;
                        const ticks = [];
                        for (let i = 0; i <= maxTick; i += step) {
                          ticks.push(i);
                        }
                        return ticks;
                      })()}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                    <Bar dataKey="totalIncome" fill="#22c55e" name="収入" />
                    <Bar dataKey="totalExpense" fill="#ef4444" name="支出" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 支出の内訳 */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedYear}年{selectedMonth}月の支出内訳</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {expenseCategories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>この月の支出データがありません</p>
                <p className="text-sm mt-2">家計簿入力ページから支出を記録してください</p>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
