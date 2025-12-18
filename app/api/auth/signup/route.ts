import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit";

const signUpSchema = z.object({
  email: z
    .string()
    .email({ message: "有効なメールアドレスを入力してください" })
    .max(255, { message: "メールアドレスは255文字以内である必要があります" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上にしてください" })
    .max(128, { message: "パスワードは128文字以内である必要があります" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "パスワードは小文字、大文字、数字を含む必要があります",
    }),
  name: z.string().max(100, { message: "名前は100文字以内である必要があります" }).optional(),
});

export async function POST(request: Request) {
  try {
    // レート制限チェック
    const identifier =
      request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
    const rateLimitResult = checkRateLimit(identifier, AUTH_RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "リクエストが多すぎます。しばらく待ってから再度お試しください。",
          retryAfter: rateLimitResult.reset,
        },
        {
          status: StatusCodes.TOO_MANY_REQUESTS,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    const body = (await request.json()) as unknown;
    const validatedData = signUpSchema.parse(body);

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      // ユーザー列挙攻撃対策: タイミング攻撃を防ぐため、わざと遅延
      await new Promise((resolve) => setTimeout(resolve, 100));
      // 既存ユーザーの存在を明示せず、一般的なメッセージを返す
      return NextResponse.json(
        {
          message: "登録処理を受け付けました。確認メールをご確認ください。",
        },
        { status: StatusCodes.OK }
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
      { status: StatusCodes.CREATED }
    );
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

    console.error("Signup error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "ユーザー登録に失敗しました" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
