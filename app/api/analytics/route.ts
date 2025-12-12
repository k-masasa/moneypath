import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDateとendDateを指定してください" }, { status: 400 });
    }

    const where: any = {
      userId: session.user.id,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // トランザクション取得（カテゴリー情報含む）
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { date: "asc" },
    });

    // カテゴリー別に集計
    const categoryStats: Record<
      string,
      {
        categoryId: string;
        categoryName: string;
        categoryType: string;
        categoryIcon?: string;
        totalAmount: number;
        count: number;
      }
    > = {};

    transactions.forEach((transaction) => {
      const categoryId = transaction.category.id;

      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = {
          categoryId: transaction.category.id,
          categoryName: transaction.category.name,
          categoryType: transaction.category.type,
          categoryIcon: transaction.category.icon || undefined,
          totalAmount: 0,
          count: 0,
        };
      }

      categoryStats[categoryId].totalAmount += Number(transaction.amount);
      categoryStats[categoryId].count += 1;
    });

    // 配列に変換してソート
    const categoryStatsArray = Object.values(categoryStats).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    // 収入・支出の合計
    const totalIncome = categoryStatsArray
      .filter((stat) => stat.categoryType === "income")
      .reduce((sum, stat) => sum + stat.totalAmount, 0);

    const totalExpense = categoryStatsArray
      .filter((stat) => stat.categoryType === "expense")
      .reduce((sum, stat) => sum + stat.totalAmount, 0);

    // 日別の集計
    const dailyStats: Record<string, { date: string; income: number; expense: number }> = {};

    transactions.forEach((transaction) => {
      const date = transaction.date.toISOString().split("T")[0];

      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          income: 0,
          expense: 0,
        };
      }

      if (transaction.category.type === "income") {
        dailyStats[date].income += Number(transaction.amount);
      } else {
        dailyStats[date].expense += Number(transaction.amount);
      }
    });

    const dailyStatsArray = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));

    // 日毎のカテゴリー別集計（支出のみ）
    const dailyCategoryStats: Record<string, Record<string, number>> = {};

    transactions.forEach((transaction) => {
      if (transaction.category.type === "expense") {
        const date = transaction.date.toISOString().split("T")[0];
        const categoryName = transaction.category.name;

        if (!dailyCategoryStats[date]) {
          dailyCategoryStats[date] = {};
        }

        if (!dailyCategoryStats[date][categoryName]) {
          dailyCategoryStats[date][categoryName] = 0;
        }

        dailyCategoryStats[date][categoryName] += Number(transaction.amount);
      }
    });

    // 配列形式に変換
    const dailyCategoryStatsArray = Object.entries(dailyCategoryStats)
      .map(([date, categories]) => ({
        date,
        categories,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.length,
      },
      categoryStats: categoryStatsArray,
      dailyStats: dailyStatsArray,
      dailyCategoryStats: dailyCategoryStatsArray,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json({ error: "統計情報の取得に失敗しました" }, { status: 500 });
  }
}
