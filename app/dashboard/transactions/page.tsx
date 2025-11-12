"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
};

type Transaction = {
  id: string;
  amount: number;
  description?: string;
  date: string;
  category: Category;
};

export default function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, transactionsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/transactions?limit=50"),
      ]);

      const categoriesData = await categoriesRes.json();
      const transactionsData = await transactionsRes.json();

      setCategories(categoriesData.categories || []);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.amount) {
      alert("カテゴリーと金額を入力してください");
      return;
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create transaction");

      await fetchData();
      setShowForm(false);
      setFormData({
        categoryId: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      alert("記録しました");
    } catch (error) {
      console.error("Submit error:", error);
      alert("記録に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この記録を削除しますか？")) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete transaction");

      await fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  // カテゴリー別にグループ化
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              家計簿入力
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/categories"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                カテゴリー管理
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {categories.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              カテゴリーが未設定です
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              家計簿を記録する前に、カテゴリーを作成してください。
            </p>
            <Link
              href="/dashboard/categories"
              className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
            >
              カテゴリー管理へ
            </Link>
          </div>
        ) : (
          <>
            {/* 入力ボタン */}
            <div className="mb-6">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition text-lg font-semibold"
              >
                {showForm ? "入力フォームを閉じる" : "+ 新規記録"}
              </button>
            </div>

            {/* 入力フォーム */}
            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  新規記録
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        カテゴリー
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({ ...formData, categoryId: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">選択してください</option>
                        {incomeCategories.length > 0 && (
                          <optgroup label="収入">
                            {incomeCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {expenseCategories.length > 0 && (
                          <optgroup label="支出">
                            {expenseCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        金額
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        placeholder="1000"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        日付
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        メモ（任意）
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="詳細メモ"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      記録する
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 記録リスト */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                最近の記録
              </h3>

              {loading ? (
                <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
              ) : transactions.length === 0 ? (
                <p className="text-gray-500">まだ記録がありません</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="text-2xl">
                          {transaction.category.icon || "📁"}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {transaction.category.name}
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                transaction.category.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.category.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.date)}
                            {transaction.description && ` - ${transaction.description}`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800 text-sm ml-4"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
