import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { Session } from "next-auth";

const transactionSchema = z.object({
  categoryId: z.string().uuid({ message: "有効なカテゴリーIDを指定してください" }),
  amount: z
    .number()
    .positive({ message: "金額は正の数である必要があります" })
    .max(1000000000, { message: "金額は10億以下である必要があります" }),
  description: z.string().max(500, { message: "説明は500文字以内である必要があります" }).optional(),
  date: z.string().datetime().optional(),
});

// トランザクション一覧取得
export async function GET(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const minAmountStr = searchParams.get("minAmount");
    const maxAmountStr = searchParams.get("maxAmount");
    const limitStr = searchParams.get("limit");

    const where: Prisma.TransactionWhereInput = { userId: session.user.id };

    if (categoryId) {
      // カテゴリーを取得して、子カテゴリーがあるかチェック
      const selectedCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          subCategories: {
            select: { id: true },
          },
        },
      });

      if (selectedCategory && selectedCategory.subCategories.length > 0) {
        // 親カテゴリーの場合: 親と子の両方を検索対象にする
        const categoryIds = [categoryId, ...selectedCategory.subCategories.map((sub) => sub.id)];
        where.categoryId = { in: categoryIds };
      } else {
        // 子カテゴリーまたは子を持たないカテゴリーの場合: そのカテゴリーのみ
        where.categoryId = categoryId;
      }
    }

    // 日付バリデーション
    if (startDateStr || endDateStr) {
      const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "日付はYYYY-MM-DD形式で指定してください",
      });

      try {
        if (startDateStr) dateSchema.parse(startDateStr);
        if (endDateStr) dateSchema.parse(endDateStr);
      } catch {
        return NextResponse.json(
          { error: "無効な日付形式です。YYYY-MM-DD形式で指定してください" },
          { status: StatusCodes.BAD_REQUEST }
        );
      }

      where.date = {};
      if (startDateStr) {
        const startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) {
          return NextResponse.json(
            { error: "無効な開始日です" },
            { status: StatusCodes.BAD_REQUEST }
          );
        }
        where.date.gte = startDate;
      }
      if (endDateStr) {
        const endDate = new Date(endDateStr);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json(
            { error: "無効な終了日です" },
            { status: StatusCodes.BAD_REQUEST }
          );
        }
        where.date.lte = endDate;
      }
    }

    // 数値バリデーション
    if (minAmountStr || maxAmountStr) {
      where.amount = {};
      if (minAmountStr) {
        const minAmount = parseFloat(minAmountStr);
        if (isNaN(minAmount) || minAmount < 0) {
          return NextResponse.json(
            { error: "最小金額は0以上の数値である必要があります" },
            { status: StatusCodes.BAD_REQUEST }
          );
        }
        where.amount.gte = minAmount;
      }
      if (maxAmountStr) {
        const maxAmount = parseFloat(maxAmountStr);
        if (isNaN(maxAmount) || maxAmount < 0) {
          return NextResponse.json(
            { error: "最大金額は0以上の数値である必要があります" },
            { status: StatusCodes.BAD_REQUEST }
          );
        }
        where.amount.lte = maxAmount;
      }
    }

    // limitとoffsetのバリデーション
    let limit: number | undefined;
    let offset: number | undefined;

    const offsetStr = searchParams.get("offset");

    if (limitStr) {
      const limitNum = parseInt(limitStr);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        return NextResponse.json(
          { error: "limitは1から1000の間である必要があります" },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
      limit = limitNum;
    }

    if (offsetStr) {
      const offsetNum = parseInt(offsetStr);
      if (isNaN(offsetNum) || offsetNum < 0) {
        return NextResponse.json(
          { error: "offsetは0以上の整数である必要があります" },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
      offset = offsetNum;
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, totalCount });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "トランザクションの取得に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

// トランザクション作成
export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = (await auth()) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: StatusCodes.UNAUTHORIZED });
    }

    const body = (await request.json()) as unknown;
    const validatedData = transactionSchema.parse(body);

    // カテゴリーの所有権確認
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "カテゴリーが見つかりません" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    if (category.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このカテゴリーを使用する権限がありません" },
        { status: StatusCodes.FORBIDDEN }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        userId: session.user.id,
      },
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

    return NextResponse.json({ transaction }, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: error.issues },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "トランザクションの作成に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
