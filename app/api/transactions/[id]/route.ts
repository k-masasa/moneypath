import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const transactionUpdateSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

// トランザクション更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = transactionUpdateSchema.parse(body);

    // トランザクションの所有権確認
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "トランザクションが見つかりません" },
        { status: 404 }
      );
    }

    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このトランザクションを編集する権限がありません" },
        { status: 403 }
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
          { status: 400 }
        );
      }
    }

    const updateData: any = { ...validatedData };
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
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Update transaction error:", error);
    return NextResponse.json(
      { error: "トランザクションの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// トランザクション削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;

    // トランザクションの所有権確認
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "トランザクションが見つかりません" },
        { status: 404 }
      );
    }

    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このトランザクションを削除する権限がありません" },
        { status: 403 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "トランザクションを削除しました" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      { error: "トランザクションの削除に失敗しました" },
      { status: 500 }
    );
  }
}
