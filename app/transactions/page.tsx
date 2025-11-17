"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoading } from "@/components/loading-provider";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, HelpCircle, Search, X, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { useSession } from "next-auth/react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
};

type Transaction = {
  id: string;
  amount: number;
  description?: string;
  date: string;
  category: Category;
  createdAt: string;
};

export default function TransactionsPage() {
  const { data: session } = useSession();
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showSearch, setShowSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    categoryId: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: "",
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const initialLoad = async () => {
      await fetchData();
      setIsInitialLoading(false);
    };
    initialLoad();

    // 収支追加時のリロード処理
    const handleTransactionAdded = () => {
      fetchData();
    };

    window.addEventListener('transactionAdded', handleTransactionAdded);

    return () => {
      window.removeEventListener('transactionAdded', handleTransactionAdded);
    };
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchData();
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (!isInitialLoading) {
      setCurrentPage(1);
      fetchData();
    }
  }, [searchFilters]);

  const fetchData = async () => {
    if (!isInitialLoading) {
      startLoading();
    }
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
      });

      if (searchFilters.categoryId) params.append("categoryId", searchFilters.categoryId);
      if (searchFilters.minAmount) params.append("minAmount", searchFilters.minAmount);
      if (searchFilters.maxAmount) params.append("maxAmount", searchFilters.maxAmount);
      if (searchFilters.startDate) params.append("startDate", searchFilters.startDate);
      if (searchFilters.endDate) params.append("endDate", searchFilters.endDate);

      const [categoriesRes, transactionsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch(`/api/transactions?${params.toString()}`),
      ]);

      const categoriesData = await categoriesRes.json();
      const transactionsData = await transactionsRes.json();

      setCategories(categoriesData.categories || []);
      setTransactions(transactionsData.transactions || []);
      setTotalCount(transactionsData.totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      if (!isInitialLoading) {
        stopLoading();
      }
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("この記録を削除しますか？")) return;

    startLoading();
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete transaction");

      await fetchData();
      toast({
        title: "削除しました",
        description: "記録を削除しました",
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      categoryId: transaction.category.id,
      amount: transaction.amount.toString(),
      description: transaction.description || "",
      date: new Date(transaction.date).toISOString().split("T")[0],
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTransaction || !editFormData.categoryId || !editFormData.amount) {
      toast({
        title: "入力エラー",
        description: "カテゴリーと金額を入力してください",
        variant: "destructive",
      });
      return;
    }

    startLoading();
    try {
      const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          amount: parseFloat(editFormData.amount),
          date: new Date(editFormData.date).toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update transaction");

      await fetchData();
      setEditingTransaction(null);
      toast({
        title: "更新しました",
        description: "記録を更新しました",
      });
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
                家計簿を記録する前に、カテゴリーを作成してください。
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
            {/* 記録リスト */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>収支履歴</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      ({totalCount}件)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSearch(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground">まだ記録がありません</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm">日付</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">科目</th>
                          <th className="text-right py-3 px-4 font-medium text-sm">金額</th>
                          <th className="text-left py-3 px-4 font-medium text-sm" style={{ maxWidth: '100px' }}>メモ</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">登録日時</th>
                          <th className="text-center py-3 px-4 font-medium text-sm w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium">
                              {transaction.category.name}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`text-sm font-bold ${
                                  transaction.category.type === "income"
                                    ? "text-green-600 dark:text-green-500"
                                    : "text-red-600 dark:text-red-500"
                                }`}
                              >
                                {transaction.category.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground" style={{ maxWidth: '100px' }}>
                              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                {transaction.description || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {formatDateTime(transaction.createdAt)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(transaction)}
                                  className="cursor-pointer h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(transaction.id)}
                                  className="text-destructive hover:text-destructive cursor-pointer h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ページネーションと表示件数切り替え */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">表示件数:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value={10}>10件</option>
                          <option value={50}>50件</option>
                          <option value={100}>100件</option>
                        </select>
                        <span className="text-sm text-muted-foreground">
                          全{totalCount}件中 {(currentPage - 1) * itemsPerPage + 1}〜
                          {Math.min(currentPage * itemsPerPage, totalCount)}件を表示
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          {currentPage} / {Math.ceil(totalCount / itemsPerPage)}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </>
        )}
      </div>

      {/* 検索ダイアログ */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSearch(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  検索条件
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">科目</label>
                  <select
                    value={searchFilters.categoryId}
                    onChange={(e) =>
                      setSearchFilters({ ...searchFilters, categoryId: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">すべて</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">金額範囲</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="最小"
                      value={searchFilters.minAmount}
                      onChange={(e) =>
                        setSearchFilters({ ...searchFilters, minAmount: e.target.value })
                      }
                    />
                    <span>〜</span>
                    <Input
                      type="number"
                      placeholder="最大"
                      value={searchFilters.maxAmount}
                      onChange={(e) =>
                        setSearchFilters({ ...searchFilters, maxAmount: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">開始日</label>
                  <Input
                    type="date"
                    value={searchFilters.startDate}
                    onChange={(e) =>
                      setSearchFilters({ ...searchFilters, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">終了日</label>
                  <Input
                    type="date"
                    value={searchFilters.endDate}
                    onChange={(e) =>
                      setSearchFilters({ ...searchFilters, endDate: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchFilters({
                        categoryId: "",
                        minAmount: "",
                        maxAmount: "",
                        startDate: "",
                        endDate: "",
                      });
                    }}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    クリア
                  </Button>
                  <Button
                    onClick={() => setShowSearch(false)}
                    className="flex-1"
                  >
                    検索
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 編集ダイアログ */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingTransaction(null)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>記録の編集</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingTransaction(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">科目</label>
                  <select
                    value={editFormData.categoryId}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, categoryId: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">選択してください</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">金額</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, amount: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">日付</label>
                  <Input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">メモ（任意）</label>
                  <Input
                    type="text"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingTransaction(null)}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" className="flex-1">
                    更新
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
