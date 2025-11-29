import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["income", "expense"]).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  isPublicBurden: z.boolean().optional(),
});

// カテゴリー更新
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
    const validatedData = categoryUpdateSchema.parse(body);

    // カテゴリーの所有権確認
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "カテゴリーが見つかりません" },
        { status: 404 }
      );
    }

    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このカテゴリーを編集する権限がありません" },
        { status: 403 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "カテゴリーの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// カテゴリー削除
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

    // カテゴリーの所有権確認
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "カテゴリーが見つかりません" },
        { status: 404 }
      );
    }

    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このカテゴリーを削除する権限がありません" },
        { status: 403 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "カテゴリーを削除しました" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "カテゴリーの削除に失敗しました" },
      { status: 500 }
    );
  }
}
