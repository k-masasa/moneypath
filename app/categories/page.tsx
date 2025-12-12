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
import { Edit, Trash2 } from "lucide-react";
import { EditCategoryDialog } from "@/components/edit-category-dialog";
import { SortableCategoryList } from "@/components/sortable-category-list";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
  order: number;
  isPublicBurden?: boolean;
  parentCategoryId?: string | null;
  parentCategory?: {
    id: string;
    name: string;
  } | null;
  subCategories?: {
    id: string;
    name: string;
    type: "income" | "expense";
    order: number;
  }[];
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    isPublicBurden: false,
    parentCategoryId: "" as string | null,
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
      // 新規作成のみ（編集はダイアログで行う）
      // 最大のorder値を取得して+1する
      const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order), -1);
      const newOrder = maxOrder + 1;

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentCategoryId: formData.parentCategoryId || null,
          order: newOrder,
        }),
      });

      if (!response.ok) throw new Error("Failed to create category");

      await fetchCategories();
      setFormData({ name: "", type: "expense", isPublicBurden: false, parentCategoryId: "" });
    } catch (error) {
      console.error("Submit error:", error);
      alert("カテゴリーの保存に失敗しました");
    } finally {
      stopLoading();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowEditDialog(true);
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

  const handleReorder = async (reorderedCategories: Category[]) => {
    startLoading();
    try {
      // 各カテゴリのorder値を更新
      const updatePromises = reorderedCategories.map((category) =>
        fetch(`/api/categories/${category.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: category.order }),
        })
      );

      await Promise.all(updatePromises);
      await fetchCategories();
    } catch (error) {
      console.error("Reorder error:", error);
      alert("並び替えの保存に失敗しました");
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

      <div className="pt-32 pl-64 container mx-auto px-4 py-8">
        {/* デフォルトカテゴリー作成ボタン */}
        {categories.length === 0 && (
          <div className="mb-6">
            <Button onClick={initializeDefaultCategories} variant="secondary">
              デフォルトカテゴリーを作成
            </Button>
          </div>
        )}

        {/* フォーム */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>新規カテゴリー</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">カテゴリー名</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        parentCategoryId: "", // タイプ変更時に親カテゴリーをリセット
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="expense">支出</option>
                    <option value="income">収入</option>
                  </select>
                </div>
              </div>

              {/* 親カテゴリー選択 */}
              <div className="space-y-2">
                <Label htmlFor="parentCategory">親カテゴリー（任意）</Label>
                <select
                  id="parentCategory"
                  value={formData.parentCategoryId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentCategoryId: e.target.value || null,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">なし（親カテゴリー）</option>
                  {categories
                    .filter(
                      (c) => c.type === formData.type && !c.parentCategoryId // 親カテゴリーのみ表示
                    )
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* 公的負担チェックボックス */}
              {formData.type === "expense" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublicBurden"
                    checked={formData.isPublicBurden}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublicBurden: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="isPublicBurden" className="cursor-pointer">
                    公的負担（税金・保険料など）
                  </Label>
                </div>
              )}

              <Button type="submit" className="w-full">
                作成
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* カテゴリーリスト */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 収入カテゴリー */}
            <div>
              <h3 className="text-xl font-bold mb-4">収入カテゴリー ({incomeCategories.length})</h3>
              <SortableCategoryList
                categories={incomeCategories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
              />
            </div>

            {/* 支出カテゴリー */}
            <div>
              <h3 className="text-xl font-bold mb-4">
                支出カテゴリー ({expenseCategories.length})
              </h3>
              <SortableCategoryList
                categories={expenseCategories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 編集ダイアログ */}
      <EditCategoryDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onUpdate={fetchCategories}
        allCategories={categories}
      />
    </div>
  );
}
