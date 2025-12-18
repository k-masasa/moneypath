import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    // 本番環境でのCORS設定（環境変数で制御）
    const allowedOrigin = process.env.ALLOWED_ORIGIN || null;

    const apiHeaders = allowedOrigin
      ? [
          {
            key: "Access-Control-Allow-Origin",
            value: allowedOrigin,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400", // 24時間
          },
        ]
      : [];

    return [
      // セキュリティヘッダー（全てのページ）
      {
        source: "/:path*",
        headers: [
          // Content Security Policy - XSS攻撃を防ぐ
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // Next.jsのHMRとReact Server Componentsのために必要
              "style-src 'self' 'unsafe-inline'; " + // Tailwind CSSのために必要
              "img-src 'self' data: blob:; " +
              "font-src 'self' data:; " +
              "connect-src 'self'; " +
              "frame-ancestors 'none'; " + // iframeでの埋め込みを防ぐ
              "base-uri 'self'; " +
              "form-action 'self';",
          },
          // クリックジャッキング攻撃を防ぐ
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // MIMEタイプスニッフィング攻撃を防ぐ
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // リファラー情報の漏洩を最小化
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 不要なブラウザ機能を無効化
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      // API エンドポイント専用のCORS設定（ALLOWED_ORIGIN環境変数がある場合のみ）
      ...(allowedOrigin
        ? [
            {
              source: "/api/:path*",
              headers: apiHeaders,
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
