# MoneyPath セットアップガイド

## 前提条件
- Docker Desktop がインストールされていること
- Node.js 20以上がインストールされていること（ローカル実行の場合）

## Docker Composeでの起動（推奨）

### 1. Docker Desktopを起動
まず、Docker Desktopアプリケーションを起動してください。

### 2. 開発環境で起動

```bash
# コンテナを起動
docker-compose -f docker-compose.dev.yml up -d

# ログを確認
docker-compose -f docker-compose.dev.yml logs -f app

# アプリケーションが起動したら、ブラウザで以下にアクセス
# http://localhost:3000
```

### 3. データベースマイグレーション

初回起動時またはスキーマ変更時に実行：

```bash
# コンテナ内でマイグレーション実行
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name init
```

### 4. 停止

```bash
docker-compose -f docker-compose.dev.yml down
```

## ローカル環境での起動（開発用）

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. データベースの起動

```bash
# MySQLコンテナだけ起動
docker-compose -f docker-compose.dev.yml up -d db
```

### 3. Prisma Clientの生成

```bash
npx prisma generate
```

### 4. マイグレーション実行

```bash
npx prisma migrate dev --name init
```

### 5. Next.jsアプリケーションの起動

```bash
npm run dev
```

### 6. ブラウザでアクセス

```
http://localhost:3000
```

## 本番環境での起動

```bash
# ビルドして起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

## ヘルスチェック

起動後、以下のエンドポイントでシステム状態を確認できます：

```
http://localhost:3000/api/health
```

正常な場合のレスポンス：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "MoneyPath API is running",
  "database": "connected"
}
```

## トラブルシューティング

### ポート3000が既に使用されている
```bash
# 使用中のプロセスを確認
lsof -i :3000

# プロセスを停止するか、docker-compose.dev.ymlのポート設定を変更
```

### データベース接続エラー
```bash
# DBコンテナの状態を確認
docker-compose -f docker-compose.dev.yml ps

# DBコンテナのログを確認
docker-compose -f docker-compose.dev.yml logs db

# DBコンテナを再起動
docker-compose -f docker-compose.dev.yml restart db
```

### Prismaクライアントのエラー
```bash
# Prismaクライアントを再生成
npx prisma generate

# マイグレーションをリセット（開発時のみ！）
npx prisma migrate reset
```
