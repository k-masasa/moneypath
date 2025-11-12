"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>("確認中...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus(data.status === "ok" ? "✓ 接続成功" : "✗ 接続失敗");
      })
      .catch(() => {
        setHealthStatus("✗ 接続失敗");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              MoneyPath
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              お金の道筋を可視化するWebアプリ
            </p>
          </div>

          {/* ヘルスチェック */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  システムステータス
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  バックエンドとの接続状態
                </p>
              </div>
              <div className="text-3xl">
                {healthStatus}
              </div>
            </div>
          </div>

          {/* 主要機能プレビュー */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                収支管理
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                現在の収入・支出・負債を入力して管理
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                目標設定
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                借金完済日や貯金目標額を設定
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                ロードマップ生成
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                達成までの道筋を自動で可視化
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                進捗管理
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                月々の必要ペースと進捗をグラフで表示
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
