import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Session } from "next-auth";
import { StatusCodes } from "http-status-codes";

const completePaymentSchema = z.object({
  actualAmount: z.number().positive(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const body = (await request.json()) as unknown;
    const validated = completePaymentSchema.parse(body);
    const { actualAmount } = validated;

    // paramsを待機
    const { id } = await params;

    // 支払い予定の存在確認とユーザー所有確認
    const scheduledPayment = await prisma.scheduledPayment.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    if (!scheduledPayment) {
      return NextResponse.json(
        { error: "支払い予定が見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    if (scheduledPayment.status === "completed") {
      return NextResponse.json(
        { error: "既に支払い済みです" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // トランザクションを使用して、支払い記録とトランザクションを同時に作成
    const result = await prisma.$transaction(async (tx) => {
      // トランザクション（支出記録）を作成
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          categoryId: scheduledPayment.categoryId,
          amount: actualAmount,
          description: scheduledPayment.memo || scheduledPayment.category.name,
          date: new Date(), // 今日の日付
        },
      });

      // 支払い予定を完了状態に更新
      const updatedScheduledPayment = await tx.scheduledPayment.update({
        where: {
          id,
        },
        data: {
          status: "completed",
          transactionId: transaction.id,
          completedAt: new Date(),
        },
        include: {
          category: true,
          transaction: true,
        },
      });

      return { scheduledPayment: updatedScheduledPayment, transaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Scheduled payment complete error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
