import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* ヘッダー */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MoneyPath
            </h1>
            <div className="space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            お金の道筋を
            <br />
            <span className="text-indigo-600 dark:text-indigo-400">可視化する</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            借金返済や目標貯金額達成までのロードマップを視覚的に表示。
            明るい将来が見えるお金管理アプリ。
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/signup"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              今すぐ始める
            </Link>
            <Link
              href="#features"
              className="inline-block bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-600 dark:hover:border-indigo-400 transition"
            >
              詳しく見る
            </Link>
          </div>
        </div>
      </section>

      {/* 主要機能 */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            主要機能
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                収支管理
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                現在の収入・支出・負債を簡単に入力して一元管理。シンプルで直感的な操作性。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                目標設定
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                借金完済日や貯金目標額を設定。達成までの期間を逆算して計算。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🗺️</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                ロードマップ生成
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                目標達成までの道筋を自動で可視化。未来への道が見える。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                進捗管理
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                月々の必要ペースと進捗をグラフで表示。視覚的に進捗を確認。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🔮</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                What-ifシミュレーション
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                節約したら？収入が増えたら？様々なシナリオをシミュレーション。
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">✨</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                前向きなUI/UX
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                希望が見えるデザイン。お金の不安を前向きなエネルギーに変換。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-indigo-600 dark:bg-indigo-700 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-white mb-4">
            今日からあなたのお金の道筋を描こう
          </h3>
          <p className="text-xl text-indigo-100 mb-8">
            無料で始められます。クレジットカード不要。
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 MoneyPath. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
