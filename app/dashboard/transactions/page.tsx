"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoading } from "@/components/loading-provider";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, HelpCircle, Search, X, Edit } from "lucide-react";

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
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const amountInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(true); // デフォルトで表示
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
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [searchFilters]);

  useEffect(() => {
    // フォーム表示時に金額欄にフォーカス
    if (showForm && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [showForm]);

  const fetchData = async () => {
    startLoading();
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
      stopLoading();
    }
  };

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

      setCurrentPage(1);
      await fetchData();

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

  // カテゴリー別にグループ化
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold cursor-pointer">
              MoneyPath
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/categories">
                <Button variant="ghost" size="sm">
                  カテゴリー管理
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">家計簿入力</h1>
        {categories.length === 0 ? (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle>カテゴリーが未設定です</CardTitle>
              <CardDescription>
                家計簿を記録する前に、カテゴリーを作成してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/categories">
                <Button>
                  カテゴリー管理へ
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 入力フォーム */}
            {showForm && (
              <Card className="mb-8">
                <CardHeader className="relative">
                  <div className="group absolute top-4 right-4">
                    <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
                    <div className="invisible group-hover:visible absolute right-0 top-8 z-50 w-64 rounded-md bg-popover p-3 text-sm text-popover-foreground shadow-md border">
                      <p className="font-semibold mb-2">使い方</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>カテゴリーを選択</li>
                        <li>金額を入力</li>
                        <li>必要に応じて日付とメモを入力</li>
                        <li>「記録する」ボタンをクリック</li>
                      </ol>
                      <p className="mt-2 text-xs text-muted-foreground">
                        同じカテゴリーで連続入力できます
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* カテゴリーチップ */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium">カテゴリー</div>

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
                                    ? ""
                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                }`}
                                style={
                                  formData.categoryId === cat.id
                                    ? {
                                        backgroundColor: "hsl(0 0% 30%)",
                                        borderColor: "hsl(0 0% 30%)",
                                        color: "hsl(0 0% 100%)",
                                      }
                                    : undefined
                                }
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
                                    ? ""
                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                }`}
                                style={
                                  formData.categoryId === cat.id
                                    ? {
                                        backgroundColor: "hsl(0 0% 30%)",
                                        borderColor: "hsl(0 0% 30%)",
                                        color: "hsl(0 0% 100%)",
                                      }
                                    : undefined
                                }
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="amount" className="text-sm font-medium">金額</label>
                        <Input
                          ref={amountInputRef}
                          id="amount"
                          type="number"
                          required
                          min="0"
                          step="1"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData({ ...formData, amount: e.target.value })
                          }
                          placeholder="1000"
                          className="text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="date" className="text-sm font-medium">日付</label>
                        <Input
                          id="date"
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">メモ（任意）</label>
                        <Input
                          id="description"
                          type="text"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="詳細メモ"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      style={{
                        backgroundColor: "hsl(0 0% 30%)",
                        color: "hsl(0 0% 100%)",
                      }}
                    >
                      記録する
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* 検索フィルター */}
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    検索条件
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    {showSearch ? "閉じる" : "開く"}
                  </Button>
                </div>
              </CardHeader>
              {showSearch && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
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
                    >
                      <X className="h-4 w-4 mr-1" />
                      クリア
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 記録リスト */}
            <Card>
              <CardHeader>
                <CardTitle>最近の記録</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground">まだ記録がありません</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm">ID</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">科目</th>
                          <th className="text-right py-3 px-4 font-medium text-sm">金額</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">登録日時</th>
                          <th className="text-center py-3 px-4 font-medium text-sm w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 text-sm text-muted-foreground font-mono">
                              {transaction.id.slice(0, 8)}
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
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          前へ
                        </Button>
                        <span className="text-sm">
                          {currentPage} / {Math.ceil(totalCount / itemsPerPage)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                        >
                          次へ
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

      {/* 編集ダイアログ */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
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
