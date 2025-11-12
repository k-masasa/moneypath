"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type CategoryStat = {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  categoryIcon?: string;
  totalAmount: number;
  count: number;
};

type AnalyticsData = {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  };
  categoryStats: CategoryStat[];
  dailyStats: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
  "#4ECDC4",
  "#95E1D3",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "custom">("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (
    startDate?: string,
    endDate?: string
  ) => {
    setLoading(true);
    try {
      let start: string;
      let end: string;

      if (startDate && endDate) {
        start = startDate;
        end = endDate;
      } else {
        const now = new Date();
        end = now.toISOString().split("T")[0];

        if (period === "week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          start = weekAgo.toISOString().split("T")[0];
        } else {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          start = monthAgo.toISOString().split("T")[0];
        }
      }

      const response = await fetch(
        `/api/analytics?startDate=${start}&endDate=${end}`
      );
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        console.error("Failed to fetch analytics:", result.error);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: "week" | "month" | "custom") => {
    setPeriod(newPeriod);
    if (newPeriod !== "custom") {
      const now = new Date();
      const end = now.toISOString().split("T")[0];
      let start: string;

      if (newPeriod === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString().split("T")[0];
      } else {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString().split("T")[0];
      }

      fetchAnalytics(start, end);
    }
  };

  const handleCustomPeriodApply = () => {
    if (customStartDate && customEndDate) {
      fetchAnalytics(customStartDate, customEndDate);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const expenseData = data?.categoryStats.filter(
    (stat) => stat.categoryType === "expense"
  ) || [];

  const incomeData = data?.categoryStats.filter(
    (stat) => stat.categoryType === "income"
  ) || [];

  const pieChartData = expenseData.map((stat) => ({
    name: stat.categoryName,
    value: stat.totalAmount,
  }));

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              分析・グラフ
            </h1>
            <Link href="/dashboard">
              <Button variant="ghost">
                ← ダッシュボードに戻る
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 期間選択 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>期間選択</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => handlePeriodChange("week")}
                variant={period === "week" ? "default" : "outline"}
              >
                過去1週間
              </Button>
              <Button
                onClick={() => handlePeriodChange("month")}
                variant={period === "month" ? "default" : "outline"}
              >
                過去1ヶ月
              </Button>
              <Button
                onClick={() => handlePeriodChange("custom")}
                variant={period === "custom" ? "default" : "outline"}
              >
                カスタム期間
              </Button>
            </div>

            {period === "custom" && (
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="startDate">開始日</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">終了日</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleCustomPeriodApply}>
                  適用
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              データの取得に失敗しました
            </p>
          </div>
        ) : data.categoryStats.length === 0 ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-6">
              <p className="text-foreground">
                この期間にデータがありません。家計簿を記録してください。
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    総収入
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {formatCurrency(data.summary.totalIncome)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    総支出
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                    {formatCurrency(data.summary.totalExpense)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    収支
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      data.summary.balance >= 0
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    {formatCurrency(data.summary.balance)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    記録数
                  </div>
                  <div className="text-2xl font-bold">
                    {data.summary.transactionCount}件
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* グラフ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 支出の円グラフ */}
              {expenseData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>支出カテゴリー別割合</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* 支出の棒グラフ */}
              {expenseData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>支出カテゴリー別金額</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={expenseData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="categoryName"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="totalAmount" fill="#FF6B6B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* カテゴリー詳細リスト */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 支出リスト */}
              {expenseData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>支出詳細</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {expenseData.map((stat) => (
                        <div
                          key={stat.categoryId}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {stat.categoryName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {stat.count}件
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600 dark:text-red-500">
                              {formatCurrency(stat.totalAmount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {((stat.totalAmount / data.summary.totalExpense) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 収入リスト */}
              {incomeData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>収入詳細</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {incomeData.map((stat) => (
                        <div
                          key={stat.categoryId}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {stat.categoryName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {stat.count}件
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600 dark:text-green-500">
                              {formatCurrency(stat.totalAmount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {((stat.totalAmount / data.summary.totalIncome) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
