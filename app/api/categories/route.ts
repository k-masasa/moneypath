import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { Session } from "next-auth";

const categorySchema = z.object({
  name: z.string().min(1, { message: "カテゴリー名を入力してください" }),
  type: z.enum(["income", "expense"], {
    message: "タイプは income または expense である必要があります",
  }),
  color: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  isPublicBurden: z.boolean().optional(),
  parentCategoryId: z.string().nullable().optional(),
});

// カテゴリー一覧取得
export async function GET(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: Prisma.CategoryWhereInput = { userId: session.user.id };
    if (type && (type === "income" || type === "expense")) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        parentCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        subCategories: {
          select: {
            id: true,
            name: true,
            type: true,
            order: true,
          },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({ error: "カテゴリーの取得に失敗しました" }, { status: 500 });
  }
}

// カテゴリー作成
export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create category error:", error);
    return NextResponse.json({ error: "カテゴリーの作成に失敗しました" }, { status: 500 });
  }
}
