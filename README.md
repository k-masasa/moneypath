# MoneyPath

家計簿・収支管理アプリケーション

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma + MySQL
- NextAuth.js
- Docker

## 機能

- ユーザー認証 (サインアップ / サインイン)
- カテゴリー管理 (収入 / 支出)
- 収支記録
- 支払い予定管理
- ダッシュボード

## セットアップ

### 必要なもの

- Node.js 20+
- Docker / Docker Compose

### 開発環境の起動

```bash
# Docker 環境で起動
docker compose -f docker-compose.dev.yml up -d

# ログ確認
docker compose -f docker-compose.dev.yml logs -f app
```

http://localhost:3000 でアクセス

### ローカル環境 (Docker なし)

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env
# .env を編集して DATABASE_URL 等を設定

# Prisma クライアント生成
npx prisma generate

# マイグレーション実行
npx prisma migrate dev

# 開発サーバー起動
npm run dev
```

## スクリプト

| コマンド               | 説明                          |
| ---------------------- | ----------------------------- |
| `npm run dev`          | 開発サーバー起動              |
| `npm run build`        | プロダクションビルド          |
| `npm run lint`         | ESLint 実行                   |
| `npm run type-check`   | TypeScript チェック           |
| `npm run format:check` | Prettier フォーマットチェック |

## ディレクトリ構成

```
app/
├── api/            # API エンドポイント
├── auth/           # 認証ページ
├── categories/     # カテゴリー管理
├── dashboard/      # ダッシュボード
├── payment-schedule/  # 支払い予定
├── profile/        # プロフィール
└── transactions/   # 収支記録

prisma/
└── schema.prisma   # DB スキーマ
```

## DB 構成

| テーブル           | 説明                         |
| ------------------ | ---------------------------- |
| users              | ユーザー                     |
| categories         | カテゴリー (収入 / 支出分類) |
| transactions       | 収支記録                     |
| scheduled_payments | 支払い予定                   |
