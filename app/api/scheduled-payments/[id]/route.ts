import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Session } from "next-auth";
import { StatusCodes } from "http-status-codes";

const updateScheduledPaymentSchema = z.object({
  categoryId: z.string().uuid(),
  estimatedAmount: z.number().positive(),
  dueDate: z.string(),
  memo: z.string().optional(),
});

// 支払い予定削除
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    // paramsを待機
    const { id } = await params;

    // 支払い予定の存在確認とユーザー所有確認
    const scheduledPayment = await prisma.scheduledPayment.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!scheduledPayment) {
      return NextResponse.json(
        { error: "支払い予定が見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // 完了済みの支払い予定は削除できない（紐付いたトランザクションがあるため）
    if (scheduledPayment.status === "completed") {
      return NextResponse.json(
        { error: "完了済みの支払い予定は削除できません" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // 支払い予定を削除
    await prisma.scheduledPayment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Scheduled payment DELETE error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

// 支払い予定更新
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validated = updateScheduledPaymentSchema.parse(body);
    const { categoryId, estimatedAmount, dueDate, memo } = validated;

    // 支払い予定の存在確認とユーザー所有確認
    const scheduledPayment = await prisma.scheduledPayment.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!scheduledPayment) {
      return NextResponse.json(
        { error: "支払い予定が見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // 完了済みの支払い予定は編集できない
    if (scheduledPayment.status === "completed") {
      return NextResponse.json(
        { error: "完了済みの支払い予定は編集できません" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // カテゴリーの存在確認
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "カテゴリーが見つかりません" }, { status: 404 });
    }

    // カテゴリから公的負担フラグを自動検出
    const isPublicBurden = category.isPublicBurden || false;

    // 更新
    const updatedScheduledPayment = await prisma.scheduledPayment.update({
      where: {
        id,
      },
      data: {
        categoryId,
        estimatedAmount,
        dueDate: new Date(dueDate),
        memo: memo || null,
        isPublicBurden,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ scheduledPayment: updatedScheduledPayment });
  } catch (error) {
    console.error(
      "Scheduled payment PUT error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
