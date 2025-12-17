"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLoading } from "@/components/loading-provider";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  isPublicBurden?: boolean;
};

type PaymentItem = {
  amount: string;
  dueDate: string;
  memo: string;
};

type AddScheduledPaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: () => Promise<void>;
};

export function AddScheduledPaymentDialog({
  open,
  onClose,
  categories,
  onAdd,
}: AddScheduledPaymentDialogProps) {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const [categoryId, setCategoryId] = useState("");
  const [payments, setPayments] = useState<PaymentItem[]>([{ amount: "", dueDate: "", memo: "" }]);

  // 支出カテゴリーのみフィルタリング
  const expenseCategories = categories.filter((c) => c.type === "expense");

  if (!open) return null;

  const handleAddPayment = () => {
    setPayments([...payments, { amount: "", dueDate: "", memo: "" }]);
  };

  const handleRemovePayment = (index: number) => {
    if (payments.length === 1) return;
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index: number, field: keyof PaymentItem, value: string) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      toast({
        title: "入力エラー",
        description: "カテゴリーを選択してください",
        variant: "destructive",
      });
      return;
    }

    const invalidPayments = payments.filter((p) => !p.amount || !p.dueDate);

    if (invalidPayments.length > 0) {
      toast({
        title: "入力エラー",
        description: "すべての金額と期限を入力してください",
        variant: "destructive",
      });
      return;
    }

    startLoading();
    try {
      // 各支払いを個別に登録
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        const response = await fetch("/api/scheduled-payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId,
            estimatedAmount: parseFloat(payment.amount),
            dueDate: new Date(payment.dueDate).toISOString(),
            memo: payment.memo || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add scheduled payment");
        }
      }

      await onAdd();
      toast({
        title: "✅ 登録しました",
        description: `${payments.length}件の支払い予定を登録しました`,
      });

      // フォームリセット
      setCategoryId("");
      setPayments([{ amount: "", dueDate: "", memo: "" }]);
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "エラー",
        description: "登録に失敗しました",
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
        className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>支払い予定を登録</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-6"
          >
            {/* カテゴリー選択 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">カテゴリー</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
              {expenseCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  支出カテゴリーがありません。
                  <br />
                  カテゴリー管理で支出カテゴリーを作成してください。
                </p>
              )}
            </div>

            {/* 支払い一覧 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">支払い予定（複数回登録可能）</label>
                <Button type="button" size="sm" variant="outline" onClick={handleAddPayment}>
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              </div>

              {payments.map((payment, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">{index + 1}回目</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="金額"
                        value={payment.amount}
                        onChange={(e) => handlePaymentChange(index, "amount", e.target.value)}
                        required
                        min="0"
                        max="1000000000"
                        step="1"
                      />
                      <Input
                        type="date"
                        value={payment.dueDate}
                        onChange={(e) => handlePaymentChange(index, "dueDate", e.target.value)}
                        required
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="メモ（任意）"
                      maxLength={500}
                      value={payment.memo}
                      onChange={(e) => handlePaymentChange(index, "memo", e.target.value)}
                    />
                  </div>
                  {payments.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemovePayment(index)}
                      className="text-destructive hover:text-destructive mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* 登録ボタン */}
            <Button type="submit" className="w-full">
              登録
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
