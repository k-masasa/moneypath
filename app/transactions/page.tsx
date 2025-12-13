import { Suspense } from "react";
import { TransactionsClient } from "./transactions-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "収支管理",
};

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsClient />
    </Suspense>
  );
}
