import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Session } from "next-auth";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: "startDateとendDateを指定してください" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // 日付バリデーション
    const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "日付はYYYY-MM-DD形式で指定してください",
    });

    try {
      dateSchema.parse(startDateStr);
      dateSchema.parse(endDateStr);
    } catch {
      return NextResponse.json(
        { error: "無効な日付形式です。YYYY-MM-DD形式で指定してください" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "無効な日付です" }, { status: StatusCodes.BAD_REQUEST });
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: "開始日は終了日より前である必要があります" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
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
        startDate: startDateStr,
        endDate: endDateStr,
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
    return NextResponse.json(
      { error: "統計情報の取得に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
