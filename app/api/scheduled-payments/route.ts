import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { Session } from "next-auth";

const scheduledPaymentSchema = z.object({
  categoryId: z.string().uuid(),
  estimatedAmount: z.number().positive(),
  dueDate: z.string(),
  memo: z.string().optional(),
});

// 支払い予定一覧取得
export async function GET(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // URLパラメータから公的負担フラグを取得
    const { searchParams } = new URL(request.url);
    const isPublicBurdenParam = searchParams.get("isPublicBurden");

    const where: Prisma.ScheduledPaymentWhereInput = {
      userId: session.user.id,
    };

    // 公的負担フィルタリング
    if (isPublicBurdenParam === "true") {
      where.isPublicBurden = true;
    } else if (isPublicBurdenParam === "false") {
      where.isPublicBurden = false;
    }

    const scheduledPayments = await prisma.scheduledPayment.findMany({
      where,
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 支払い予定登録
export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const validated = scheduledPaymentSchema.parse(body);
    const { categoryId, estimatedAmount, dueDate, memo } = validated;

    // カテゴリーの存在確認とユーザー所有確認
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
        type: "expense", // 支出カテゴリーのみ許可
      },
    });

    if (!category) {
      return NextResponse.json({ error: "カテゴリーが見つかりません" }, { status: 404 });
    }

    // カテゴリに公的負担フラグがあるか確認
    const isPublicBurden = category.isPublicBurden || false;

    // 支払い予定を作成
    const scheduledPayment = await prisma.scheduledPayment.create({
      data: {
        userId: session.user.id,
        categoryId,
        estimatedAmount,
        dueDate: new Date(dueDate),
        memo: memo || null,
        status: "pending",
        isPublicBurden,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ scheduledPayment }, { status: 201 });
  } catch (error) {
    console.error("Scheduled payment POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
