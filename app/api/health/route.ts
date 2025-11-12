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
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        database: "disconnected",
      },
      { status: 500 }
    );
  }
}
