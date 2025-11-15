import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTransactionData() {
  try {
    console.log('🗑️  収入・支出データの削除を開始します...');

    // Transaction, Income, Expense の削除
    const deletedTransactions = await prisma.transaction.deleteMany({});
    console.log(`✅ Transactionデータ削除完了: ${deletedTransactions.count}件`);

    const deletedIncomes = await prisma.income.deleteMany({});
    console.log(`✅ Incomeデータ削除完了: ${deletedIncomes.count}件`);

    const deletedExpenses = await prisma.expense.deleteMany({});
    console.log(`✅ Expenseデータ削除完了: ${deletedExpenses.count}件`);

    console.log('✨ 全ての収入・支出データを削除しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearTransactionData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
