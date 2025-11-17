"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type TransactionDialogContextType = {
  openTransactionDialog: () => void;
  closeTransactionDialog: () => void;
};

const TransactionDialogContext = createContext<TransactionDialogContextType | undefined>(undefined);

export function TransactionDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
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

  const handleAdd = async () => {
    // ダイアログは閉じない（連続入力のため）
    // 必要に応じてデータのリフレッシュなどをここで行う
  };

  const openTransactionDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTransactionDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <TransactionDialogContext.Provider value={{ openTransactionDialog, closeTransactionDialog }}>
      {children}
      <AddTransactionDialog
        open={isOpen}
        onClose={closeTransactionDialog}
        categories={categories}
        onAdd={handleAdd}
      />
    </TransactionDialogContext.Provider>
  );
}

export function useTransactionDialog() {
  const context = useContext(TransactionDialogContext);
  if (context === undefined) {
    throw new Error("useTransactionDialog must be used within TransactionDialogProvider");
  }
  return context;
}
