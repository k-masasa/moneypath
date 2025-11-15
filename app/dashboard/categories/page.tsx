"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoading } from "@/components/loading-provider";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { useSession } from "next-auth/react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
  order: number;
};

const DEFAULT_CATEGORIES = [
  { name: "収入", type: "income" as const, order: 0 },
  { name: "食費", type: "expense" as const, order: 1 },
  { name: "食費 (Uber)", type: "expense" as const, order: 2 },
  { name: "ビール", type: "expense" as const, order: 3 },
  { name: "交通費", type: "expense" as const, order: 4 },
  { name: "服・靴", type: "expense" as const, order: 5 },
  { name: "美容", type: "expense" as const, order: 6 },
  { name: "日用品", type: "expense" as const, order: 7 },
  { name: "家賃", type: "expense" as const, order: 8 },
  { name: "スマホ代", type: "expense" as const, order: 9 },
  { name: "ペット", type: "expense" as const, order: 10 },
  { name: "仕事ツール", type: "expense" as const, order: 11 },
  { name: "娯楽", type: "expense" as const, order: 12 },
  { name: "国民健康保険", type: "expense" as const, order: 13 },
  { name: "市民税", type: "expense" as const, order: 14 },
  { name: "電気代", type: "expense" as const, order: 15 },
  { name: "貯金", type: "expense" as const, order: 16 },
  { name: "送金", type: "expense" as const, order: 17 },
  { name: "その他", type: "expense" as const, order: 18 },
];

export default function CategoriesPage() {
  const { data: session } = useSession();
  const { startLoading, stopLoading } = useLoading();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    startLoading();
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      stopLoading();
    }
  };

  const initializeDefaultCategories = async () => {
    startLoading();
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
      stopLoading();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();

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
      setFormData({ name: "", type: "expense", order: 0 });
    } catch (error) {
      console.error("Submit error:", error);
      alert("カテゴリーの保存に失敗しました");
    } finally {
      stopLoading();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      order: category.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このカテゴリーを削除しますか？")) return;

    startLoading();
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete category");

      await fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
      alert("カテゴリーの削除に失敗しました");
    } finally {
      stopLoading();
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={session?.user?.email || ""} />
      <DashboardSidebar />

      <div className="pt-24 pl-64 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">カテゴリー管理</h1>
        {/* アクションボタン */}
        <div className="mb-6 flex gap-4">
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingCategory(null);
              setFormData({ name: "", type: "expense", order: 0 });
            }}
          >
            + 新規カテゴリー
          </Button>

          {categories.length === 0 && (
            <Button
              onClick={initializeDefaultCategories}
              variant="secondary"
            >
              デフォルトカテゴリーを作成
            </Button>
          )}
        </div>

        {/* フォーム */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingCategory ? "カテゴリー編集" : "新規カテゴリー"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">カテゴリー名</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">タイプ</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as "income" | "expense",
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="expense">支出</option>
                      <option value="income">収入</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">表示順序</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit">
                    {editingCategory ? "更新" : "作成"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCategory(null);
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* カテゴリーリスト */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 収入カテゴリー */}
            <div>
              <h3 className="text-xl font-bold mb-4">
                収入カテゴリー ({incomeCategories.length})
              </h3>
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <span className="font-medium">
                        {category.name}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(category)}
                          className="cursor-pointer"
                        >
                          編集
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive hover:text-destructive cursor-pointer"
                        >
                          削除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {incomeCategories.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    収入カテゴリーがありません
                  </p>
                )}
              </div>
            </div>

            {/* 支出カテゴリー */}
            <div>
              <h3 className="text-xl font-bold mb-4">
                支出カテゴリー ({expenseCategories.length})
              </h3>
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <span className="font-medium">
                        {category.name}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(category)}
                          className="cursor-pointer"
                        >
                          編集
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive hover:text-destructive cursor-pointer"
                        >
                          削除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {expenseCategories.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    支出カテゴリーがありません
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
