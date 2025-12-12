import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 過去12ヶ月の開始日と終了日を計算
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // 全トランザクションを取得（カテゴリー情報含む）
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: { date: "asc" },
    });

    // 支出カテゴリーのリストを取得
    const expenseCategories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
        type: "expense",
      },
      orderBy: {
        order: "asc",
      },
    });

    // カテゴリー名のリストを作成
    const categoryNames = expenseCategories.map((cat) => cat.name);

    // 月別のデータを集計
    const monthlyData: Record<string, any> = {};

    // 過去12ヶ月分の月を初期化
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}/${date.getMonth() + 1}`;

      monthlyData[monthKey] = {
        month: monthKey,
        income: 0,
      };

      // 各カテゴリーの支出を0で初期化
      categoryNames.forEach((catName) => {
        monthlyData[monthKey][catName] = 0;
      });
    }

    // トランザクションを月別・カテゴリー別に集計
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}/${date.getMonth() + 1}`;

      if (!monthlyData[monthKey]) return;

      if (transaction.category.type === "income") {
        monthlyData[monthKey].income += Number(transaction.amount);
      } else if (transaction.category.type === "expense") {
        const categoryName = transaction.category.name;
        if (monthlyData[monthKey][categoryName] !== undefined) {
          monthlyData[monthKey][categoryName] += Number(transaction.amount);
        }
      }
    });

    // 配列に変換（月順にソート済み）
    const monthsArray = Object.values(monthlyData);

    return NextResponse.json({
      months: monthsArray,
      categories: categoryNames,
    });
  } catch (error) {
    console.error("Stacked area data API error:", error);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}
