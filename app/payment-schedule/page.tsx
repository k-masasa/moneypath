"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoading } from "@/components/loading-provider";
import { useToast } from "@/components/ui/use-toast";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";
import { Trash2, Plus, Edit } from "lucide-react";
import { CompletePaymentDialog } from "@/components/complete-payment-dialog";
import { AddScheduledPaymentDialog } from "@/components/add-scheduled-payment-dialog";
import { EditScheduledPaymentDialog } from "@/components/edit-scheduled-payment-dialog";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
};

type ScheduledPayment = {
  id: string;
  estimatedAmount: number;
  dueDate: string;
  memo?: string | null;
  status: string;
  categoryId: string;
  category: Category;
};

export default function PaymentSchedulePage() {
  const { data: session } = useSession();
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<ScheduledPayment | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<ScheduledPayment | null>(null);

  useEffect(() => {
    const initialLoad = async () => {
      await Promise.all([fetchCategories(), fetchScheduledPayments()]);
      setIsInitialLoading(false);
    };
    initialLoad();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchScheduledPayments = async () => {
    if (!isInitialLoading) {
      startLoading();
    }
    try {
      // すべての支払い予定を取得（公的負担もそれ以外も）
      const response = await fetch("/api/scheduled-payments");
      const data = await response.json();
      setScheduledPayments(data.scheduledPayments || []);
    } catch (error) {
      console.error("Failed to fetch scheduled payments:", error);
    } finally {
      if (!isInitialLoading) {
        stopLoading();
      }
    }
  };

  const handlePaymentComplete = async (actualAmount: number) => {
    if (!selectedPayment) return;

    startLoading();
    try {
      const response = await fetch(
        `/api/scheduled-payments/${selectedPayment.id}/complete`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actualAmount }),
        }
      );

      if (!response.ok) throw new Error("Failed to complete payment");

      await fetchScheduledPayments();
      setSelectedPayment(null);

      toast({
        title: "✅ 支払いを記録しました",
        description: `¥${actualAmount.toLocaleString()} を記録しました`,
      });

      // 紙吹雪アニメーション
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#10b981", "#059669"],
      });
    } catch (error) {
      console.error("Payment completion error:", error);
      toast({
        title: "エラー",
        description: "支払いの記録に失敗しました",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (id: string) => {
    startLoading();
    try {
      const response = await fetch(`/api/scheduled-payments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete scheduled payment");

      await fetchScheduledPayments();
      toast({
        title: "削除しました",
        description: "支払い予定を削除しました",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "エラー",
        description: "削除に失敗しました",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

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

  // 未払い合計額計算
  const totalPending = pendingPayments.reduce(
    (sum, p) => sum + Number(p.estimatedAmount),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={session?.user?.email || ""} />
      <DashboardSidebar />

      <div className="pt-32 pl-64 container mx-auto px-4 py-8">
        {isInitialLoading ? (
          <Card className="mb-8">
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">読み込み中...</div>
            </CardContent>
          </Card>
        ) : categories.length === 0 ? (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle>カテゴリーが未設定です</CardTitle>
              <CardDescription>
                支払い予定を登録する前に、カテゴリーを作成してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/categories">
                <Button>カテゴリー管理へ</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 支払い予定リスト */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle>支払い予定一覧</CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">未払い:</span>
                      <span className="font-bold text-orange-600">
                        {formatCurrency(totalPending)}
                      </span>
                      <span className="text-muted-foreground">
                        ({pendingPayments.length}件)
                      </span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    新規登録
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pendingPayments.length === 0 ? (
                  <p className="text-muted-foreground">
                    現在、未払いの支払い予定はありません
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium text-sm">カテゴリ</th>
                          <th className="text-left py-3 px-2 font-medium text-sm">メモ</th>
                          <th className="text-right py-3 px-2 font-medium text-sm">金額</th>
                          <th className="text-left py-3 px-2 font-medium text-sm">期限</th>
                          <th className="text-right py-3 px-2 font-medium text-sm">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingPayments.map((payment) => {
                          const overdue = isOverdue(payment.dueDate);

                          return (
                            <tr
                              key={payment.id}
                              className={`border-b hover:bg-muted/50 ${
                                overdue ? "bg-red-50 dark:bg-red-950/20" : ""
                              }`}
                            >
                              <td className="py-3 px-2">
                                <span className="font-medium">{payment.category.name}</span>
                              </td>
                              <td className="py-3 px-2 text-sm text-muted-foreground">
                                {payment.memo || "-"}
                              </td>
                              <td className="py-3 px-2 text-right font-medium">
                                {formatCurrency(payment.estimatedAmount)}
                              </td>
                              <td className={`py-3 px-2 ${overdue ? "text-red-600 font-medium" : ""}`}>
                                {formatDate(payment.dueDate)}
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedPayment(payment)}
                                  >
                                    支払う
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingPayment(payment)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={async () => {
                                      if (confirm("この支払い予定を削除しますか？")) {
                                        await handleDelete(payment.id);
                                      }
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 支払い完了ダイアログ */}
      {selectedPayment && (
        <CompletePaymentDialog
          open={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          scheduledPayment={selectedPayment}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* 支払い予定登録ダイアログ */}
      <AddScheduledPaymentDialog
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        categories={categories}
        onAdd={fetchScheduledPayments}
      />

      {/* 支払い予定編集ダイアログ */}
      <EditScheduledPaymentDialog
        open={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        scheduledPayment={editingPayment}
        categories={categories}
        onUpdate={fetchScheduledPayments}
      />
    </div>
  );
}
