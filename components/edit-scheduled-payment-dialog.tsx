"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLoading } from "@/components/loading-provider";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  isPublicBurden?: boolean;
};

type ScheduledPayment = {
  id: string;
  estimatedAmount: number;
  dueDate: string;
  memo?: string | null;
  categoryId: string;
};

type EditScheduledPaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  scheduledPayment: ScheduledPayment | null;
  categories: Category[];
  onUpdate: () => Promise<void>;
};

export function EditScheduledPaymentDialog({
  open,
  onClose,
  scheduledPayment,
  categories,
  onUpdate,
}: EditScheduledPaymentDialogProps) {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const [formData, setFormData] = useState({
    categoryId: "",
    estimatedAmount: "",
    dueDate: "",
    memo: "",
  });

  // 支出カテゴリーのみフィルタリング
  const expenseCategories = categories.filter((c) => c.type === "expense");

  useEffect(() => {
    if (scheduledPayment) {
      // dueDateをYYYY-MM-DD形式に変換
      const date = new Date(scheduledPayment.dueDate);
      const formattedDate = date.toISOString().split("T")[0];

      setFormData({
        categoryId: scheduledPayment.categoryId,
        estimatedAmount: scheduledPayment.estimatedAmount.toString(),
        dueDate: formattedDate,
        memo: scheduledPayment.memo || "",
      });
    }
  }, [scheduledPayment]);

  if (!open || !scheduledPayment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.estimatedAmount || !formData.dueDate) {
      toast({
        title: "入力エラー",
        description: "すべての必須項目を入力してください",
        variant: "destructive",
      });
      return;
    }

    startLoading();
    try {
      const response = await fetch(`/api/scheduled-payments/${scheduledPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          estimatedAmount: parseFloat(formData.estimatedAmount),
          dueDate: new Date(formData.dueDate).toISOString(),
          memo: formData.memo || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update scheduled payment");

      await onUpdate();
      toast({
        title: "✅ 更新しました",
        description: "支払い予定を更新しました",
      });

      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "エラー",
        description: "更新に失敗しました",
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
            <CardTitle>支払い予定を編集</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* カテゴリー選択 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                カテゴリー <span className="text-red-500">*</span>
              </label>
              <select
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

            {/* 金額 */}
            <div className="space-y-2">
              <label htmlFor="edit-amount" className="text-sm font-medium">
                予定金額 <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="10000"
                value={formData.estimatedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedAmount: e.target.value })
                }
                required
                min="0"
                step="1"
              />
            </div>

            {/* 期限 */}
            <div className="space-y-2">
              <label htmlFor="edit-dueDate" className="text-sm font-medium">
                期限 <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
            </div>

            {/* メモ */}
            <div className="space-y-2">
              <label htmlFor="edit-memo" className="text-sm font-medium">
                メモ
              </label>
              <Input
                id="edit-memo"
                type="text"
                placeholder="メモ（任意）"
                value={formData.memo}
                onChange={(e) =>
                  setFormData({ ...formData, memo: e.target.value })
                }
              />
            </div>

            <Button type="submit" className="w-full">
              更新
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
