import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 支払い予定一覧取得
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const scheduledPayments = await prisma.scheduledPayment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json({ scheduledPayments });
  } catch (error) {
    console.error("Scheduled payments GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 支払い予定登録
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { name, categoryId, estimatedAmount, dueDate } = body;

    // バリデーション
    if (!name || !categoryId || !estimatedAmount || !dueDate) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // カテゴリーの存在確認とユーザー所有確認
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
        type: "expense", // 支出カテゴリーのみ許可
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "カテゴリーが見つかりません" },
        { status: 404 }
      );
    }

    // 支払い予定を作成
    const scheduledPayment = await prisma.scheduledPayment.create({
      data: {
        userId: session.user.id,
        name,
        categoryId,
        estimatedAmount,
        dueDate: new Date(dueDate),
        status: "pending",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ scheduledPayment }, { status: 201 });
  } catch (error) {
    console.error("Scheduled payment POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
