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
};

type PaymentItem = {
  amount: string;
  dueDate: string;
};

type AddPublicBurdenFormProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: () => Promise<void>;
};

const PUBLIC_BURDEN_TYPES = [
  { value: "resident_tax", label: "住民税" },
  { value: "health_insurance", label: "健康保険料" },
  { value: "pension", label: "国民年金" },
  { value: "income_tax", label: "所得税" },
  { value: "consumption_tax", label: "消費税" },
];

export function AddPublicBurdenForm({
  open,
  onClose,
  categories,
  onAdd,
}: AddPublicBurdenFormProps) {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const [burdenType, setBurdenType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [payments, setPayments] = useState<PaymentItem[]>([
    { amount: "", dueDate: "" },
  ]);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  if (!open) return null;

  const handleAddPayment = () => {
    setPayments([...payments, { amount: "", dueDate: "" }]);
  };

  const handleRemovePayment = (index: number) => {
    if (payments.length === 1) return;
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (
    index: number,
    field: keyof PaymentItem,
    value: string
  ) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!burdenType || !categoryId) {
      toast({
        title: "入力エラー",
        description: "種類とカテゴリーを選択してください",
        variant: "destructive",
      });
      return;
    }

    const invalidPayments = payments.filter(
      (p) => !p.amount || !p.dueDate
    );

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
      const burdenTypeName =
        PUBLIC_BURDEN_TYPES.find((t) => t.value === burdenType)?.label || "";

      // 各支払いを個別に登録
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        const response = await fetch("/api/scheduled-payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${burdenTypeName} (${i + 1}/${payments.length}回目)`,
            categoryId,
            estimatedAmount: parseFloat(payment.amount),
            dueDate: new Date(payment.dueDate).toISOString(),
            isPublicBurden: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add public burden");
        }
      }

      await onAdd();
      toast({
        title: "✅ 登録しました",
        description: `${burdenTypeName}を${payments.length}件登録しました`,
      });

      // フォームリセット
      setBurdenType("");
      setCategoryId("");
      setPayments([{ amount: "", dueDate: "" }]);
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
            <CardTitle>公的負担を一括登録</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 種類選択 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">種類</label>
              <select
                value={burdenType}
                onChange={(e) => setBurdenType(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">選択してください</option>
                {PUBLIC_BURDEN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* カテゴリー選択 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">カテゴリー（科目）</label>
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
            </div>

            {/* 支払い一覧 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">支払いスケジュール</label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddPayment}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              </div>

              {payments.map((payment, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      {index + 1}回目
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="金額"
                        value={payment.amount}
                        onChange={(e) =>
                          handlePaymentChange(index, "amount", e.target.value)
                        }
                        required
                        min="0"
                        step="1"
                      />
                      <Input
                        type="date"
                        value={payment.dueDate}
                        onChange={(e) =>
                          handlePaymentChange(index, "dueDate", e.target.value)
                        }
                        required
                      />
                    </div>
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
              一括登録
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
