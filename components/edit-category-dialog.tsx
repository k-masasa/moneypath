"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLoading } from "@/components/loading-provider";

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

type EditCategoryDialogProps = {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  onUpdate: () => Promise<void>;
  allCategories: Category[]; // 親カテゴリー選択用
};

export function EditCategoryDialog({
  open,
  onClose,
  category,
  onUpdate,
  allCategories,
}: EditCategoryDialogProps) {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    isPublicBurden: false,
    parentCategoryId: null as string | null,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        isPublicBurden: category.isPublicBurden || false,
        parentCategoryId: category.parentCategoryId || null,
      });
    }
  }, [category]);

  if (!open || !category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startLoading();
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update category");

      await onUpdate();
      toast({
        title: "✅ 更新しました",
        description: `${formData.name}を更新しました`,
      });

      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "エラー",
        description: "カテゴリーの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>カテゴリー編集</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">カテゴリー名</Label>
              <Input
                id="edit-category-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category-type">タイプ</Label>
              <select
                id="edit-category-type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "income" | "expense",
                    parentCategoryId: null, // タイプ変更時に親カテゴリーをリセット
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="expense">支出</option>
                <option value="income">収入</option>
              </select>
            </div>

            {/* 親カテゴリー選択 */}
            <div className="space-y-2">
              <Label htmlFor="edit-parent-category">親カテゴリー（任意）</Label>
              <select
                id="edit-parent-category"
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
                {allCategories
                  .filter((c) => {
                    // 同じタイプのみ
                    if (c.type !== formData.type) return false;
                    // 自分自身は除外
                    if (c.id === category?.id) return false;
                    // 自分の子カテゴリーは除外（循環参照防止）
                    if (c.parentCategoryId === category?.id) return false;
                    // 親カテゴリーのみ表示
                    if (c.parentCategoryId) return false;
                    return true;
                  })
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* 公的負担チェックボックス */}
            {formData.type === "expense" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-category-isPublicBurden"
                  checked={formData.isPublicBurden}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isPublicBurden: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-category-isPublicBurden" className="cursor-pointer">
                  公的負担（税金・保険料など）
                </Label>
              </div>
            )}

            <Button type="submit" className="w-full">
              更新
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
