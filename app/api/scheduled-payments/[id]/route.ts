import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 支払い予定削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
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
        { status: 404 }
      );
    }

    // 完了済みの支払い予定は削除できない（紐付いたトランザクションがあるため）
    if (scheduledPayment.status === "completed") {
      return NextResponse.json(
        { error: "完了済みの支払い予定は削除できません" },
        { status: 400 }
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
    console.error("Scheduled payment DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
