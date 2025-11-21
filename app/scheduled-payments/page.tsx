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
import { ScheduledPaymentsList } from "@/components/scheduled-payments-list";
import { CompletePaymentDialog } from "@/components/complete-payment-dialog";
import { AddScheduledPaymentDialog } from "@/components/add-scheduled-payment-dialog";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
};

type ScheduledPayment = {
  id: string;
  name: string;
  estimatedAmount: number;
  dueDate: string;
  status: string;
  category: Category;
};

export default function ScheduledPaymentsPage() {
  const { data: session } = useSession();
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<ScheduledPayment | null>(null);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
      const response = await fetch("/api/scheduled-payments?isPublicBurden=false");
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

  const handleScheduledPaymentDelete = async (id: string) => {
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
      console.error("Delete scheduled payment error:", error);
      toast({
        title: "エラー",
        description: "削除に失敗しました",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  const handleAddScheduledPayment = async (data: {
    name: string;
    categoryId: string;
    estimatedAmount: number;
    dueDate: string;
  }) => {
    startLoading();
    try {
      const response = await fetch("/api/scheduled-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dueDate: new Date(data.dueDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to add scheduled payment");
      }

      await fetchScheduledPayments();
      toast({
        title: "✅ 登録しました",
        description: `${data.name} を支払い予定に追加しました`,
      });
    } catch (error) {
      console.error("Add scheduled payment error:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "登録に失敗しました",
        variant: "destructive",
      });
      throw error;
    } finally {
      stopLoading();
    }
  };

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
                <Button>
                  カテゴリー管理へ
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 支払い予定リスト */}
            <ScheduledPaymentsList
              scheduledPayments={scheduledPayments}
              onPaymentClick={setSelectedPayment}
              onDelete={handleScheduledPaymentDelete}
              onAddClick={() => setShowAddPaymentDialog(true)}
            />
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

      {/* 支払い予定追加ダイアログ */}
      <AddScheduledPaymentDialog
        open={showAddPaymentDialog}
        onClose={() => setShowAddPaymentDialog(false)}
        categories={categories}
        onAdd={handleAddScheduledPayment}
      />
    </div>
  );
}
