import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Session } from "next-auth";

const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["income", "expense"]).optional(),
  order: z.number().int().optional(),
  isPublicBurden: z.boolean().optional(),
  parentCategoryId: z.string().nullable().optional(),
});

// カテゴリー更新
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validatedData = categoryUpdateSchema.parse(body);

    // カテゴリーの所有権確認
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "カテゴリーが見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このカテゴリーを編集する権限がありません" },
        { status: StatusCodes.FORBIDDEN }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ category });
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
      "Update category error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "カテゴリーの更新に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

// カテゴリー削除
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const { id } = await params;

    // カテゴリーの所有権確認
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "カテゴリーが見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このカテゴリーを削除する権限がありません" },
        { status: StatusCodes.FORBIDDEN }
      );
    }

    // 関連するトランザクション数を確認
    const relatedTransactionsCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (relatedTransactionsCount > 0) {
      return NextResponse.json(
        {
          error: "このカテゴリーには関連するトランザクションがあります",
          transactionCount: relatedTransactionsCount,
          suggestion: "先にトランザクションを削除するか、別のカテゴリーに移動してください",
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "カテゴリーを削除しました" });
  } catch (error) {
    console.error(
      "Delete category error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "カテゴリーの削除に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
