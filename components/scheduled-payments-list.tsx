"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Calendar, DollarSign, Plus } from "lucide-react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type ScheduledPayment = {
  id: string;
  name: string;
  estimatedAmount: number;
  dueDate: string;
  status: string;
  category: Category;
};

type ScheduledPaymentsListProps = {
  scheduledPayments: ScheduledPayment[];
  onPaymentClick: (payment: ScheduledPayment) => void;
  onDelete: (id: string) => Promise<void>;
  onAddClick: () => void;
};

export function ScheduledPaymentsList({
  scheduledPayments,
  onPaymentClick,
  onDelete,
  onAddClick,
}: ScheduledPaymentsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const isOverdue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const pendingPayments = scheduledPayments.filter((p) => p.status === "pending");

  if (pendingPayments.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>支払い予定</CardTitle>
            <Button size="sm" onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">現在、支払い予定はありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>支払い予定</CardTitle>
            <span className="text-sm text-muted-foreground">({pendingPayments.length}件)</span>
          </div>
          <Button size="sm" onClick={onAddClick}>
            <Plus className="h-4 w-4 mr-1" />
            追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingPayments.map((payment) => {
            const overdue = isOverdue(payment.dueDate);

            return (
              <div
                key={payment.id}
                className={`border rounded-lg p-4 ${
                  overdue ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{payment.name}</h3>
                      {overdue && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                          期限超過
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          {formatCurrency(payment.estimatedAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className={overdue ? "text-red-600 font-medium" : ""}>
                          {formatDate(payment.dueDate)}
                        </span>
                      </div>

                      <div className="text-xs bg-muted px-2 py-1 rounded">
                        {payment.category.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onPaymentClick(payment)}>
                      支払う
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (confirm("この支払い予定を削除しますか？")) {
                          await onDelete(payment.id);
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
