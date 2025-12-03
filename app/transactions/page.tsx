import { Suspense } from "react";
import { TransactionsClient } from "./transactions-client";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsClient />
    </Suspense>
  );
}
