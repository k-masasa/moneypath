import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
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
    ];
  },
};

export default nextConfig;
