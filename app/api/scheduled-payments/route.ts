import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { Session } from "next-auth";
import { StatusCodes } from "http-status-codes";

const scheduledPaymentSchema = z.object({
  categoryId: z.string().uuid(),
  estimatedAmount: z
    .number()
    .positive({ message: "予定金額は正の数である必要があります" })
    .max(1000000000, { message: "予定金額は10億以下である必要があります" }),
  dueDate: z.string(),
  memo: z.string().max(500, { message: "メモは500文字以内である必要があります" }).optional(),
});

// 支払い予定一覧取得
export async function GET(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
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
    console.error(
      "Scheduled payments GET error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

// 支払い予定登録
export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
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
      return NextResponse.json(
        { error: "カテゴリーが見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
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

    return NextResponse.json({ scheduledPayment }, { status: StatusCodes.CREATED });
  } catch (error) {
    console.error(
      "Scheduled payment POST error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
