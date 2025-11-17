"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type AddScheduledPaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (data: {
    name: string;
    categoryId: string;
    estimatedAmount: number;
    dueDate: string;
  }) => Promise<void>;
};

export function AddScheduledPaymentDialog({
  open,
  onClose,
  categories,
  onAdd,
}: AddScheduledPaymentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    estimatedAmount: "",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 支出カテゴリーのみフィルタリング
  const expenseCategories = categories.filter((c) => c.type === "expense");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.estimatedAmount);
    if (!formData.name || !formData.categoryId || amount <= 0 || !formData.dueDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        name: formData.name,
        categoryId: formData.categoryId,
        estimatedAmount: amount,
        dueDate: formData.dueDate,
      });

      // フォームをリセット
      setFormData({
        name: "",
        categoryId: "",
        estimatedAmount: "",
        dueDate: "",
      });
      onClose();
    } catch (error) {
      console.error("Add scheduled payment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>支払い予定を追加</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                支払い名 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例：健康保険、家賃"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                カテゴリー <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">選択してください</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="estimatedAmount" className="text-sm font-medium">
                予定金額 <span className="text-red-500">*</span>
              </label>
              <Input
                id="estimatedAmount"
                type="number"
                required
                min="0"
                step="1"
                value={formData.estimatedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedAmount: e.target.value })
                }
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                支払い期限 <span className="text-red-500">*</span>
              </label>
              <Input
                id="dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "登録中..." : "登録"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
