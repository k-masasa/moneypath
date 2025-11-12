import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // ダッシュボードにアクセスしようとしている場合
  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // ログイン済みで認証ページにアクセスしようとしている場合
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
