import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 現在の資産を取得
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        initialBalance: true,
        balanceStartDate: true,
      },
    });

    if (!user?.initialBalance || !user?.balanceStartDate) {
      return NextResponse.json({
        hasBalance: false,
        message: "初期残高が設定されていません",
      });
    }

    // 開始日以降のトランザクションを取得
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: user.balanceStartDate,
        },
      },
      include: {
        category: true,
      },
    });

    // 収入と支出の合計を計算
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.category.type === "income") {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    });

    // 現在の資産 = 初期残高 + 収入 - 支出
    const currentBalance = Number(user.initialBalance) + totalIncome - totalExpense;

    return NextResponse.json({
      hasBalance: true,
      initialBalance: Number(user.initialBalance),
      balanceStartDate: user.balanceStartDate,
      totalIncome,
      totalExpense,
      currentBalance,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      { error: "資産情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 初期残高を設定
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { initialBalance, balanceStartDate } = body;

    if (!initialBalance || !balanceStartDate) {
      return NextResponse.json(
        { error: "初期残高と開始日を指定してください" },
        { status: 400 }
      );
    }

    // ユーザー情報を更新
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        initialBalance: parseFloat(initialBalance),
        balanceStartDate: new Date(balanceStartDate),
      },
    });

    return NextResponse.json({
      success: true,
      initialBalance: Number(user.initialBalance),
      balanceStartDate: user.balanceStartDate,
    });
  } catch (error) {
    console.error("Update balance error:", error);
    return NextResponse.json(
      { error: "初期残高の設定に失敗しました" },
      { status: 500 }
    );
  }
}
