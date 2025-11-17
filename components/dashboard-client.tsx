"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, BarChart3, TrendingDown, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/components/loading-provider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

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
  savingsRate: number;
};

type BalanceData = {
  hasBalance: boolean;
  initialBalance?: number;
  balanceStartDate?: string;
  totalIncome?: number;
  totalExpense?: number;
  currentBalance?: number;
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
  const [balanceData, setBalanceData] = useState<BalanceData>({ hasBalance: false });
  const [isTrendLoading, setIsTrendLoading] = useState(false);

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

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/user/balance");
      if (response.ok) {
        const data = await response.json();
        setBalanceData(data);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

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
    setIsTrendLoading(true);
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

        let totalIncome = 0;
        let totalExpense = 0;
        let balance = 0;

        if (response.ok) {
          const data = await response.json();
          totalIncome = data.summary.totalIncome || 0;
          totalExpense = data.summary.totalExpense || 0;
          balance = data.summary.balance || 0;
        }

        // 貯蓄率を計算（収入が0の場合は0%）
        const savingsRate = totalIncome > 0
          ? Math.max(0, Math.min(100, ((totalIncome - totalExpense) / totalIncome) * 100))
          : 0;

        // データがない月も0として追加
        trends.push({
          year,
          month,
          label: `${year}/${month}`,
          totalIncome,
          totalExpense,
          balance,
          savingsRate,
        });
      }

      setMonthlyTrends(trends);
    } catch (error) {
      console.error("Failed to fetch monthly trends:", error);
    } finally {
      setIsTrendLoading(false);
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

  // 円グラフのカスタムラベル線
  const renderCustomLabelLine = (entry: any) => {
    const { cx, cy, midAngle, outerRadius } = entry;
    const RADIAN = Math.PI / 180;
    // 線の始点：円の外周
    const x1 = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const y1 = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    // 線の終点：ラベル位置（円の外側から150px離れた位置）
    const radius = outerRadius + 50;
    const x2 = cx + radius * Math.cos(-midAngle * RADIAN);
    const y2 = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth={1} />
    );
  };

  // 円グラフのカスタムラベル（テキストを黒に固定）
  const renderCustomLabel = (entry: any) => {
    const { cx, cy, midAngle, outerRadius } = entry;
    const { categoryName, totalAmount } = entry.payload;
    const RADIAN = Math.PI / 180;
    // ラベルを円の外側からさらに150px離す
    const radius = outerRadius + 50;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = ((totalAmount / stats.totalExpense) * 100).toFixed(0);
    return (
      <text x={x} y={y} fill="#000" fontSize={14} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${categoryName} (${percentage}%)`}
      </text>
    );
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
  const COLORS = ['#2d2d2d', '#4a4a4a', '#6b6b6b', '#8c8c8c', '#adadad'];
  const OTHER_COLOR = '#cecece'; // 6つ目以降の色（薄いグレー）

  // 色を取得する関数（上位5つまで異なる色、6つ目以降は同じ色）
  const getColor = (index: number) => {
    return index < 5 ? COLORS[index] : OTHER_COLOR;
  };

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader userEmail={userEmail} />
        <DashboardSidebar />
        <div className="pt-32 pl-64 container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
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

      <div className="pt-32 pl-64 container mx-auto px-4 py-8">
        {/* 現在の資産 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">
              {(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                return `${year}/${month}/${day} 時点の資産`;
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceData.hasBalance ? (
              <div className="space-y-3">
                <div className={`text-5xl font-bold ${(balanceData.currentBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(balanceData.currentBalance || 0) < 0 && '-'}
                  {formatCurrency(Math.abs(balanceData.currentBalance || 0))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {balanceData.balanceStartDate && `${new Date(balanceData.balanceStartDate).toLocaleDateString('ja-JP')} に記録開始`}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">初期残高が設定されていません</p>
                <Link href="/settings">
                  <Button>初期残高を設定する</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 12ヶ月トレンドグラフ（貯蓄率含む） */}
        {monthlyTrends.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">収支推移</CardTitle>
                <div className="flex items-center gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
              {isTrendLoading ? (
                <div className="w-full h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Wallet className="h-12 w-12 animate-pulse text-primary" />
                    <p className="text-sm text-muted-foreground">データを読み込んでいます...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="label"
                      stroke="#666"
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const currentMonth = `${now.getFullYear()}/${now.getMonth() + 1}`;
                        const isCurrentMonth = payload.value === currentMonth;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="middle"
                              fill="#666"
                              fontSize={12}
                              fontWeight={isCurrentMonth ? 'bold' : 'normal'}
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#666"
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                      ticks={(() => {
                        const maxValue = Math.max(
                          ...monthlyTrends.map(t => Math.max(t.totalIncome, t.totalExpense)),
                          0
                        );
                        const step = 100000;
                        const maxTick = Math.ceil(maxValue / step) * step;
                        const ticks = [];
                        for (let i = 0; i <= maxTick; i += step) {
                          ticks.push(i);
                        }
                        return ticks;
                      })()}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      hide
                    />
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => {
                        if (name === '貯蓄額') {
                          // 貯蓄額を計算
                          const income = props.payload.totalIncome || 0;
                          const expense = props.payload.totalExpense || 0;
                          const savings = income - expense;
                          return formatCurrency(savings);
                        }
                        return formatCurrency(value);
                      }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalIncome"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', r: 4 }}
                      name="収入"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="totalExpense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 4 }}
                      name="支出"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="savingsRate"
                      stroke="#6b7280"
                      strokeWidth={2}
                      dot={{ fill: '#6b7280', r: 4 }}
                      name="貯蓄額"
                    />
                  </LineChart>
                </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 支出の内訳 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>支出内訳 ({selectedYear}/{selectedMonth})</CardTitle>
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCurrentMonth}
                  className="cursor-pointer"
                  title="今月に戻る"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {expenseCategories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>この月の支出データがありません</p>
                <p className="text-sm mt-2">家計簿入力ページから支出を記録してください</p>
              </div>
            ) : (
              <div className="w-full h-[800px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartExpenseCategories}
                      dataKey="totalAmount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      startAngle={90}
                      endAngle={-270}
                      label={renderCustomLabel}
                      labelLine={renderCustomLabelLine}
                    >
                      {chartExpenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(index)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
