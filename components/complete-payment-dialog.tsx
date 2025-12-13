"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

type CompletePaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  scheduledPayment: {
    id: string;
    estimatedAmount: number;
    memo?: string | null;
    category: {
      name: string;
    };
  };
  onComplete: (actualAmount: number) => Promise<void>;
};

export function CompletePaymentDialog({
  open,
  onClose,
  scheduledPayment,
  onComplete,
}: CompletePaymentDialogProps) {
  const [actualAmount, setActualAmount] = useState(scheduledPayment.estimatedAmount.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(actualAmount);
    if (amount <= 0 || isNaN(amount)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(amount);
      onClose();
    } catch (error) {
      console.error("Payment completion error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>支払いを完了</CardTitle>
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
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">カテゴリ</label>
              <div className="text-base font-semibold">{scheduledPayment.category.name}</div>
            </div>

            {scheduledPayment.memo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">メモ</label>
                <div className="text-sm text-muted-foreground">{scheduledPayment.memo}</div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">予定金額</label>
              <div className="text-sm text-muted-foreground">
                ¥{scheduledPayment.estimatedAmount.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="actualAmount" className="text-sm font-medium">
                実際の支払い金額 <span className="text-red-500">*</span>
              </label>
              <Input
                id="actualAmount"
                type="number"
                required
                min="0"
                step="1"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                placeholder="1000"
                className="text-lg"
                autoFocus
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
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "処理中..." : "支払いを記録"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
