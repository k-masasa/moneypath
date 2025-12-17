"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLoading } from "@/components/loading-provider";
import confetti from "canvas-confetti";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type AddTransactionDialogProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: () => Promise<void>;
};

export function AddTransactionDialog({
  open,
  onClose,
  categories,
  onAdd,
}: AddTransactionDialogProps) {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const amountInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })(),
  });

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  useEffect(() => {
    // カテゴリー取得後、支出の最初のカテゴリーを選択
    if (categories.length > 0 && !formData.categoryId) {
      if (expenseCategories.length > 0) {
        setFormData({ ...formData, categoryId: expenseCategories[0].id });
        // カテゴリー設定後、金額欄にフォーカス
        setTimeout(() => {
          amountInputRef.current?.focus();
        }, 100);
      }
    }
  }, [categories]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.amount) {
      toast({
        title: "入力エラー",
        description: "カテゴリーと金額を入力してください",
        variant: "destructive",
      });
      return;
    }

    startLoading();
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

      await onAdd();

      // カテゴリーはそのまま、金額とメモだけクリア
      setFormData({
        ...formData,
        amount: "",
        description: "",
      });

      toast({
        title: "✅ 記録しました",
        description: `¥${parseFloat(formData.amount).toLocaleString()} を記録しました`,
      });

      // 紙吹雪アニメーション
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#10b981", "#059669"],
      });

      // カスタムイベントを発火（transactionsページでリスニング）
      window.dispatchEvent(new CustomEvent("transactionAdded"));

      // 金額欄に再フォーカス
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "エラー",
        description: "記録に失敗しました",
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
            <CardTitle>収支を記録</CardTitle>
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
            {/* カテゴリーチップ */}
            <div className="space-y-3">
              {incomeCategories.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground font-medium">収入</div>
                  <div className="flex flex-wrap gap-2">
                    {incomeCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, categoryId: cat.id });
                          setTimeout(() => amountInputRef.current?.focus(), 0);
                        }}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer border h-9 px-3 ${
                          formData.categoryId === cat.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {expenseCategories.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground font-medium">支出</div>
                  <div className="flex flex-wrap gap-2">
                    {expenseCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, categoryId: cat.id });
                          setTimeout(() => amountInputRef.current?.focus(), 0);
                        }}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer border h-9 px-3 ${
                          formData.categoryId === cat.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  ref={amountInputRef}
                  id="amount"
                  type="number"
                  required
                  min="0"
                  max="1000000000"
                  step="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="金額"
                />
              </div>

              <div>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  id="description"
                  type="text"
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="メモ（任意）"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              記録する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
