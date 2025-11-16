import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 今月の開始日と終了日を取得
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 支出カテゴリーを取得
    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
        type: "expense",
      },
      orderBy: {
        order: "asc",
      },
    });

    // 各カテゴリーの今月の支出を集計
    const budgetProgress = await Promise.all(
      categories.map(async (category: any) => {
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: session.user.id,
            categoryId: category.id,
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        const spent = transactions.reduce(
          (sum: number, t: any) => sum + Number(t.amount),
          0
        );

        const budget = category.monthlyBudget
          ? Number(category.monthlyBudget)
          : null;

        const percentage = budget && budget > 0 ? (spent / budget) * 100 : 0;

        return {
          id: category.id,
          name: category.name,
          budget,
          spent,
          percentage: Math.round(percentage),
          color: category.color || "#8c8c8c",
        };
      })
    );

    // 予算が設定されているカテゴリーのみ返す（または全て返すかはUI次第）
    return NextResponse.json({ categories: budgetProgress });
  } catch (error) {
    console.error("Budget progress API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
