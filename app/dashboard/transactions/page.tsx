"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoading } from "@/components/loading-provider";

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
};

export default function TransactionsPage() {
  const { startLoading, stopLoading } = useLoading();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    startLoading();
    try {
      const [categoriesRes, transactionsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/transactions?limit=50"),
      ]);

      const categoriesData = await categoriesRes.json();
      const transactionsData = await transactionsRes.json();

      setCategories(categoriesData.categories || []);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      stopLoading();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.amount) {
      alert("カテゴリーと金額を入力してください");
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

      await fetchData();
      setShowForm(false);
      setFormData({
        categoryId: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      alert("記録しました");
    } catch (error) {
      console.error("Submit error:", error);
      alert("記録に失敗しました");
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
    } catch (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました");
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

  // カテゴリー別にグループ化
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-2xl font-bold cursor-pointer">
                MoneyPath
              </Link>
              <h1 className="text-xl text-muted-foreground">
                家計簿入力
              </h1>
            </div>
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
            {/* 入力ボタン */}
            <div className="mb-6">
              <Button
                onClick={() => setShowForm(!showForm)}
                size="lg"
              >
                {showForm ? "入力フォームを閉じる" : "+ 新規記録"}
              </Button>
            </div>

            {/* 入力フォーム */}
            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>新規記録</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="categoryId">カテゴリー</Label>
                        <select
                          id="categoryId"
                          required
                          value={formData.categoryId}
                          onChange={(e) =>
                            setFormData({ ...formData, categoryId: e.target.value })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">選択してください</option>
                          {incomeCategories.length > 0 && (
                            <optgroup label="収入">
                              {incomeCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {expenseCategories.length > 0 && (
                            <optgroup label="支出">
                              {expenseCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">金額</Label>
                        <Input
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">日付</Label>
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
                        <Label htmlFor="description">メモ（任意）</Label>
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

                    <div className="flex gap-4">
                      <Button type="submit">
                        記録する
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* 記録リスト */}
            <Card>
              <CardHeader>
                <CardTitle>最近の記録</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground">まだ記録がありません</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <Card key={transaction.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {transaction.category.name}
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  transaction.category.type === "income"
                                    ? "text-green-600 dark:text-green-500"
                                    : "text-red-600 dark:text-red-500"
                                }`}
                              >
                                {transaction.category.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                              {transaction.description && ` - ${transaction.description}`}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-destructive hover:text-destructive ml-4 cursor-pointer"
                          >
                            削除
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
