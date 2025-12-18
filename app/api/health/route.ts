import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // データベース接続確認
    await prisma.$connect();
    await prisma.$disconnect();

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "MoneyPath API is running",
      database: "connected",
    });
  } catch (error) {
    // エラーの詳細はサーバー側のログにのみ記録
    console.error("Health check failed:", error instanceof Error ? error.message : "Unknown error");

    // クライアントには一般的なエラーメッセージのみを返す
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        database: "disconnected",
      },
      { status: 500 }
    );
  }
}
