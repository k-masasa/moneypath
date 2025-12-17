"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("登録が完了しました。ログインしてください。");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("メールアドレスまたはパスワードが正しくありません");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                required
                maxLength={255}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                required
                maxLength={128}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4 bg-muted/50">
          <Card className="w-full max-w-md">
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">読み込み中...</div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
