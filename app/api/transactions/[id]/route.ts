import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { Session } from "next-auth";

const transactionUpdateSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

// トランザクション更新
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validatedData = transactionUpdateSchema.parse(body);

    // トランザクションの所有権確認
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "トランザクションが見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このトランザクションを編集する権限がありません" },
        { status: StatusCodes.FORBIDDEN }
      );
    }

    // カテゴリーが変更される場合、所有権確認
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category || category.userId !== session.user.id) {
        return NextResponse.json(
          { error: "無効なカテゴリーIDです" },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    }

    const updateData: Prisma.TransactionUpdateInput = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "入力内容に誤りがあります", fields: fieldErrors },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    console.error(
      "Update transaction error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "トランザクションの更新に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

// トランザクション削除
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const { id } = await params;

    // トランザクションの所有権確認
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "トランザクションが見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このトランザクションを削除する権限がありません" },
        { status: StatusCodes.FORBIDDEN }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "トランザクションを削除しました" });
  } catch (error) {
    console.error(
      "Delete transaction error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "トランザクションの削除に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
