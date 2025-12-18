import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { Session } from "next-auth";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "カテゴリー名を入力してください" })
    .max(50, { message: "カテゴリー名は50文字以内である必要があります" }),
  type: z.enum(["income", "expense"], {
    message: "タイプは income または expense である必要があります",
  }),
  color: z.string().max(20, { message: "カラーコードは20文字以内である必要があります" }).optional(),
  icon: z.string().max(50, { message: "アイコン名は50文字以内である必要があります" }).optional(),
  order: z.number().int().optional(),
  isPublicBurden: z.boolean().optional(),
  parentCategoryId: z
    .string()
    .max(36, { message: "親カテゴリーIDは36文字以内である必要があります" })
    .nullable()
    .optional(),
});

// カテゴリー一覧取得
export async function GET(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
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
    console.error(
      "Get categories error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "カテゴリーの取得に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

// カテゴリー作成
export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const body = (await request.json()) as unknown;
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ category }, { status: StatusCodes.CREATED });
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
      "Create category error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "カテゴリーの作成に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
