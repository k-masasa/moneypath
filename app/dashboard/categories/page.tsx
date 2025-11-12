"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
  order: number;
};

const DEFAULT_CATEGORIES = [
  { name: "収入", type: "income" as const, icon: "💰", order: 0 },
  { name: "食費", type: "expense" as const, icon: "🍽️", order: 1 },
  { name: "食費 (Uber)", type: "expense" as const, icon: "🚗", order: 2 },
  { name: "ビール", type: "expense" as const, icon: "🍺", order: 3 },
  { name: "交通費", type: "expense" as const, icon: "🚃", order: 4 },
  { name: "服・靴", type: "expense" as const, icon: "👔", order: 5 },
  { name: "美容", type: "expense" as const, icon: "💅", order: 6 },
  { name: "日用品", type: "expense" as const, icon: "🧴", order: 7 },
  { name: "家賃", type: "expense" as const, icon: "🏠", order: 8 },
  { name: "スマホ代", type: "expense" as const, icon: "📱", order: 9 },
  { name: "ペット", type: "expense" as const, icon: "🐕", order: 10 },
  { name: "仕事ツール", type: "expense" as const, icon: "💼", order: 11 },
  { name: "娯楽", type: "expense" as const, icon: "🎮", order: 12 },
  { name: "国民健康保険", type: "expense" as const, icon: "🏥", order: 13 },
  { name: "市民税", type: "expense" as const, icon: "🏛️", order: 14 },
  { name: "電気代", type: "expense" as const, icon: "⚡", order: 15 },
  { name: "貯金", type: "expense" as const, icon: "🏦", order: 16 },
  { name: "送金", type: "expense" as const, icon: "💸", order: 17 },
  { name: "その他", type: "expense" as const, icon: "📦", order: 18 },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    icon: "",
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultCategories = async () => {
    setLoading(true);
    try {
      for (const category of DEFAULT_CATEGORIES) {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(category),
        });
      }
      await fetchCategories();
      alert("デフォルトカテゴリーを作成しました");
    } catch (error) {
      console.error("Failed to initialize categories:", error);
      alert("カテゴリーの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        // 更新
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to update category");
      } else {
        // 新規作成
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to create category");
      }

      await fetchCategories();
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: "", type: "expense", icon: "", order: 0 });
    } catch (error) {
      console.error("Submit error:", error);
      alert("カテゴリーの保存に失敗しました");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || "",
      order: category.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このカテゴリーを削除しますか？")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete category");

      await fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
      alert("カテゴリーの削除に失敗しました");
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              カテゴリー管理
            </h1>
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* アクションボタン */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCategory(null);
              setFormData({ name: "", type: "expense", icon: "", order: 0 });
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + 新規カテゴリー
          </button>

          {categories.length === 0 && !loading && (
            <button
              onClick={initializeDefaultCategories}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              デフォルトカテゴリーを作成
            </button>
          )}
        </div>

        {/* フォーム */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingCategory ? "カテゴリー編集" : "新規カテゴリー"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カテゴリー名
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    タイプ
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "income" | "expense",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="expense">支出</option>
                    <option value="income">収入</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    アイコン（絵文字）
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="🍽️"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    表示順序
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingCategory ? "更新" : "作成"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* カテゴリーリスト */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 収入カテゴリー */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                収入カテゴリー ({incomeCategories.length})
              </h3>
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon || "📁"}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
                {incomeCategories.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    収入カテゴリーがありません
                  </p>
                )}
              </div>
            </div>

            {/* 支出カテゴリー */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                支出カテゴリー ({expenseCategories.length})
              </h3>
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon || "📁"}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
                {expenseCategories.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    支出カテゴリーがありません
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
