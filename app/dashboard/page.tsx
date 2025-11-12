import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900 dark:text-white">
              MoneyPath
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* ウェルカムセクション */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ようこそ、{session.user.name || session.user.email}さん
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            あなたのお金の道筋を管理しましょう
          </p>
        </div>

        {/* クイック統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                月収入
              </h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ¥0
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              収入データを追加してください
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                月支出
              </h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ¥0
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              支出データを追加してください
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                総負債
              </h3>
              <span className="text-2xl">📉</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ¥0
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              負債データを追加してください
            </p>
          </div>
        </div>

        {/* アクションカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/dashboard/transactions"
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition"
          >
            <h3 className="text-2xl font-bold mb-3">収支を記録する</h3>
            <p className="mb-6 text-indigo-100">
              毎月の収入と支出を記録して、お金の流れを把握しましょう。
            </p>
            <span className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              家計簿を入力 →
            </span>
          </Link>

          <Link
            href="/dashboard/categories"
            className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition"
          >
            <h3 className="text-2xl font-bold mb-3">カテゴリーを管理</h3>
            <p className="mb-6 text-pink-100">
              支出や収入のカテゴリーを自分好みにカスタマイズしましょう。
            </p>
            <span className="inline-block bg-white text-pink-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              カテゴリー管理 →
            </span>
          </Link>
        </div>

        {/* クイックリンク */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard/transactions"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              家計簿入力
            </div>
          </Link>

          <Link
            href="/dashboard/categories"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">🏷️</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              カテゴリー管理
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 opacity-50 text-center cursor-not-allowed">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              目標設定（準備中）
            </div>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            これから使える機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  収支・負債管理
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  現在の収入、支出、負債を一元管理
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  目標達成ロードマップ
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  借金完済や貯金目標達成までの道筋を可視化
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  進捗グラフ表示
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  月々の進捗を視覚的に確認
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  What-ifシミュレーション
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  様々なシナリオでの未来を予測
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
