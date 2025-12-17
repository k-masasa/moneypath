import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signUpSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください" })
    .max(255, { message: "メールアドレスは255文字以内である必要があります" }),
  password: z
    .string()
    .min(6, { message: "パスワードは6文字以上にしてください" })
    .max(128, { message: "パスワードは128文字以内である必要があります" }),
  name: z.string().max(100, { message: "名前は100文字以内である必要があります" }).optional(),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const validatedData = signUpSchema.parse(body);

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "ユーザー登録が完了しました",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json({ error: "ユーザー登録に失敗しました" }, { status: 500 });
  }
}
