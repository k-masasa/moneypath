"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTransactionDialog } from "@/components/transaction-dialog-provider";

interface DashboardHeaderProps {
  userEmail: string;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const { openTransactionDialog } = useTransactionDialog();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ backgroundColor: '#f6f8fa' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">
            MoneyPath
          </Link>
          <Button
            size="icon"
            onClick={openTransactionDialog}
            className="rounded-full h-12 w-12 cursor-pointer"
            title="収支を記録"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
