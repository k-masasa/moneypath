import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearTransactionData() {
  try {
    console.log("🗑️  収支データの削除を開始します...");

    // Transaction の削除（Income/Expenseテーブルは廃止済み）
    const deletedTransactions = await prisma.transaction.deleteMany({});
    console.log(`✅ Transactionデータ削除完了: ${deletedTransactions.count}件`);

    console.log("✨ 全ての収支データを削除しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearTransactionData().catch((error) => {
  console.error(error);
  process.exit(1);
});
