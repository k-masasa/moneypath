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
import { Trash2, Calendar, DollarSign, Plus } from "lucide-react";
import { CompletePaymentDialog } from "@/components/complete-payment-dialog";
import { AddPublicBurdenForm } from "@/components/add-public-burden-form";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
};

type PublicBurden = {
  id: string;
  name: string;
  estimatedAmount: number;
  dueDate: string;
  status: string;
  category: Category;
};

export default function PublicBurdensPage() {
  const { data: session } = useSession();
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [publicBurdens, setPublicBurdens] = useState<PublicBurden[]>([]);
  const [selectedBurden, setSelectedBurden] = useState<PublicBurden | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const initialLoad = async () => {
      await Promise.all([fetchCategories(), fetchPublicBurdens()]);
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

  const fetchPublicBurdens = async () => {
    if (!isInitialLoading) {
      startLoading();
    }
    try {
      const response = await fetch("/api/scheduled-payments?isPublicBurden=true");
      const data = await response.json();
      setPublicBurdens(data.scheduledPayments || []);
    } catch (error) {
      console.error("Failed to fetch public burdens:", error);
    } finally {
      if (!isInitialLoading) {
        stopLoading();
      }
    }
  };

  const handlePaymentComplete = async (actualAmount: number) => {
    if (!selectedBurden) return;

    startLoading();
    try {
      const response = await fetch(
        `/api/scheduled-payments/${selectedBurden.id}/complete`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actualAmount }),
        }
      );

      if (!response.ok) throw new Error("Failed to complete payment");

      await fetchPublicBurdens();
      setSelectedBurden(null);

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

      if (!response.ok) throw new Error("Failed to delete public burden");

      await fetchPublicBurdens();
      toast({
        title: "削除しました",
        description: "公的負担を削除しました",
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

  const pendingBurdens = publicBurdens.filter((b) => b.status === "pending");
  const completedBurdens = publicBurdens.filter((b) => b.status === "completed");

  // 年間合計額計算
  const totalPending = pendingBurdens.reduce(
    (sum, b) => sum + b.estimatedAmount,
    0
  );
  const totalCompleted = completedBurdens.reduce(
    (sum, b) => sum + b.estimatedAmount,
    0
  );
  const totalAmount = totalPending + totalCompleted;

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
                公的負担を登録する前に、カテゴリーを作成してください。
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
            {/* サマリーカード */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>年間公的負担サマリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">年間合計</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">支払い済み</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalCompleted)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">未払い</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(totalPending)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 公的負担リスト */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>公的負担一覧</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      ({pendingBurdens.length}件未払い)
                    </span>
                  </div>
                  <Button size="sm" onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    一括登録
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pendingBurdens.length === 0 ? (
                  <p className="text-muted-foreground">
                    現在、未払いの公的負担はありません
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingBurdens.map((burden) => {
                      const overdue = isOverdue(burden.dueDate);

                      return (
                        <div
                          key={burden.id}
                          className={`border rounded-lg p-4 ${
                            overdue
                              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base">
                                  {burden.name}
                                </h3>
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
                                    {formatCurrency(burden.estimatedAmount)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span
                                    className={
                                      overdue ? "text-red-600 font-medium" : ""
                                    }
                                  >
                                    {formatDate(burden.dueDate)}
                                  </span>
                                </div>

                                <div className="text-xs bg-muted px-2 py-1 rounded">
                                  {burden.category.name}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => setSelectedBurden(burden)}
                              >
                                支払う
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  if (confirm("この公的負担を削除しますか？")) {
                                    await handleDelete(burden.id);
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
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 支払い完了ダイアログ */}
      {selectedBurden && (
        <CompletePaymentDialog
          open={!!selectedBurden}
          onClose={() => setSelectedBurden(null)}
          scheduledPayment={selectedBurden}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* 一括登録フォーム */}
      <AddPublicBurdenForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        categories={categories}
        onAdd={fetchPublicBurdens}
      />
    </div>
  );
}
