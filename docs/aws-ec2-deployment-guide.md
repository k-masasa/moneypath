# AWS EC2 + Docker Compose デプロイ手順書

## 概要

このガイドでは、AWS EC2インスタンス上にDocker Composeを使用してMoneyPathアプリケーションをデプロイする手順を説明します。

## 前提条件

- AWSアカウントを持っていること（無料利用枠対象）
- 基本的なLinuxコマンドの知識
- GitHubアカウント（コード取得用）

## コスト概要

### 1年目（無料利用枠）
- **EC2 t2.micro**: 月750時間まで無料（24時間x31日=744時間、ほぼ無料）
- **EBS ストレージ**: 30GBまで無料
- **データ転送**: 15GBまで無料
- **合計**: ほぼ無料（0円〜数百円程度）

### 2年目以降
- **EC2 t2.micro**: 約3,000円/月
- **EBS 30GB**: 約300円/月
- **データ転送**: 約100〜500円/月（使用量による）
- **Elastic IP**: 使用中は無料、未使用時は課金
- **合計**: 約3,500〜4,200円/月

## デプロイ手順

---

## ステップ1: AWSアカウントのセットアップ（10分）

### 1-1. AWSアカウント作成
1. https://aws.amazon.com/jp/ にアクセス
2. 「無料で始める」をクリック
3. メールアドレス、パスワードを設定
4. 連絡先情報を入力
5. クレジットカード情報を登録（無料枠でも必要）
6. 電話番号認証
7. サポートプラン選択（無料の「ベーシック」を選択）

### 1-2. IAMユーザーの作成（セキュリティのため）
1. AWSコンソールにログイン
2. IAMサービスを検索して開く
3. 「ユーザー」→「ユーザーを追加」
4. ユーザー名: `moneypath-admin`
5. アクセス権限:
   - `AdministratorAccess`（最初は簡単のため。本番運用時は最小権限に変更推奨）
6. アクセスキーを作成（後で使用）

---

## ステップ2: EC2インスタンスの起動（20分）

### 2-1. EC2インスタンスの作成
1. EC2サービスを開く
2. 「インスタンスを起動」をクリック
3. インスタンス設定:
   - **名前**: `moneypath-production`
   - **AMI**: Ubuntu Server 24.04 LTS
   - **インスタンスタイプ**: t2.micro（無料枠対象）
   - **キーペア**: 新規作成
     - 名前: `moneypath-key`
     - タイプ: RSA
     - ファイル形式: .pem
     - **重要**: ダウンロードしたキーペアは安全な場所に保存！
   - **ネットワーク設定**:
     - VPC: デフォルト
     - サブネット: デフォルト
     - パブリックIPの自動割り当て: 有効
     - セキュリティグループ:
       - SSH (22): 自分のIPのみ許可
       - HTTP (80): 0.0.0.0/0（全て許可）
       - HTTPS (443): 0.0.0.0/0（全て許可）
       - カスタムTCP (3000): 0.0.0.0/0（Next.jsアプリ用）
   - **ストレージ**: 30GB gp3（無料枠対象）

4. 「インスタンスを起動」をクリック

### 2-2. Elastic IPの割り当て（固定IPアドレス）
1. EC2ダッシュボードで「Elastic IP」を選択
2. 「Elastic IPアドレスを割り当てる」
3. 「割り当て」をクリック
4. 割り当てられたIPを選択
5. 「アクション」→「Elastic IPアドレスの関連付け」
6. インスタンス: `moneypath-production`を選択
7. 「関連付け」をクリック

**注意**: Elastic IPは**インスタンスに関連付けている間は無料**ですが、**未使用時は課金**されます。

### 2-3. SSH接続の準備
```bash
# キーペアのパーミッション変更（Mac/Linux）
chmod 400 ~/Downloads/moneypath-key.pem

# EC2に接続（Elastic IPアドレスを使用）
ssh -i ~/Downloads/moneypath-key.pem ubuntu@<あなたのElastic IP>
```

---

## ステップ3: EC2インスタンスの初期セットアップ（30分）

EC2インスタンスにSSH接続した状態で以下を実行します。

### 3-1. システムアップデート
```bash
sudo apt update
sudo apt upgrade -y
```

### 3-2. Dockerのインストール
```bash
# 必要なパッケージのインストール
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Docker公式GPGキーの追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Dockerリポジトリの追加
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Dockerのインストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Dockerの起動と自動起動設定
sudo systemctl start docker
sudo systemctl enable docker

# 現在のユーザーをdockerグループに追加（sudoなしでdockerコマンドを実行可能に）
sudo usermod -aG docker $USER

# グループ変更を反映（一度ログアウト→再ログインでも可）
newgrp docker

# Docker動作確認
docker --version
```

### 3-3. Docker Composeのインストール
```bash
# Docker Compose最新版のインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 実行権限を付与
sudo chmod +x /usr/local/bin/docker-compose

# Docker Compose動作確認
docker-compose --version
```

### 3-4. Gitのインストール
```bash
sudo apt install -y git

# Git動作確認
git --version
```

---

## ステップ4: アプリケーションのデプロイ（60分）

### 4-1. リポジトリのクローン
```bash
# ホームディレクトリに移動
cd ~

# リポジトリをクローン（HTTPSの場合）
git clone https://github.com/<あなたのユーザー名>/moneypath.git

# プロジェクトディレクトリに移動
cd moneypath
```

**プライベートリポジトリの場合**:
```bash
# GitHub Personal Access Token (PAT) を作成
# https://github.com/settings/tokens で作成

# PATを使ってクローン
git clone https://<PAT>@github.com/<あなたのユーザー名>/moneypath.git
```

### 4-2. 本番用docker-compose.ymlの作成
```bash
# 本番用のdocker-composeファイルを作成
nano docker-compose.prod.yml
```

以下の内容を貼り付け:

```yaml
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    depends_on:
      db:
        condition: service_healthy

volumes:
  mysql_data:
```

### 4-3. 本番用Dockerfileの作成
```bash
nano Dockerfile.prod
```

以下の内容を貼り付け:

```dockerfile
# ベースイメージ
FROM node:20-alpine AS base

# 依存関係インストール用ステージ
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ビルド用ステージ
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Generate
RUN npx prisma generate

# Next.js ビルド
RUN npm run build

# 本番実行用ステージ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# システムユーザーの作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# エントリーポイントスクリプトをコピー
COPY docker-entrypoint.prod.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.prod.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.prod.sh"]
CMD ["node", "server.js"]
```

### 4-4. エントリーポイントスクリプトの作成
```bash
nano docker-entrypoint.prod.sh
```

以下の内容を貼り付け:

```bash
#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 10

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec "$@"
```

### 4-5. next.config.tsの修正
```bash
nano next.config.ts
```

`output: 'standalone'`を追加:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // ← この行を追加
};

export default nextConfig;
```

### 4-6. 環境変数の設定
```bash
nano .env.production
```

以下の内容を貼り付け（値は実際の値に置き換え）:

```bash
# MySQL設定
MYSQL_ROOT_PASSWORD=your_root_password_here
MYSQL_DATABASE=moneypath
MYSQL_USER=moneypath_user
MYSQL_PASSWORD=your_mysql_password_here

# データベース接続URL
DATABASE_URL="mysql://moneypath_user:your_mysql_password_here@db:3306/moneypath"

# NextAuth設定
NEXTAUTH_URL=http://<あなたのElastic IP>:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth設定
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**重要な値の生成**:
```bash
# NEXTAUTH_SECRETの生成（ランダムな文字列）
openssl rand -base64 32
```

**Google OAuth設定**:
1. https://console.cloud.google.com/ にアクセス
2. 新規プロジェクト作成 or 既存プロジェクト選択
3. 「APIとサービス」→「認証情報」
4. 「認証情報を作成」→「OAuthクライアントID」
5. アプリケーションの種類: ウェブアプリケーション
6. 承認済みのリダイレクトURI:
   - `http://<あなたのElastic IP>:3000/api/auth/callback/google`
7. クライアントIDとシークレットをコピー

### 4-7. アプリケーションのビルドと起動
```bash
# docker-composeでビルド＆起動
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# ログを確認
docker-compose -f docker-compose.prod.yml logs -f app
```

### 4-8. データベース初期化（初回のみ）
```bash
# Prisma migrationsを実行
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# （オプション）Prisma Studioでデータ確認
docker-compose -f docker-compose.prod.yml exec app npx prisma studio
```

---

## ステップ5: 動作確認（10分）

### 5-1. アプリケーションへのアクセス
ブラウザで以下にアクセス:
```
http://<あなたのElastic IP>:3000
```

### 5-2. Google OAuth動作確認
1. 「Googleでログイン」をクリック
2. Google認証画面が表示されることを確認
3. ログイン成功を確認

### 5-3. 各機能の動作確認
- [ ] ダッシュボード表示
- [ ] 収支登録
- [ ] カテゴリー管理
- [ ] 支払い予定
- [ ] グラフ表示

---

## ステップ6: 本番運用設定（30分）

### 6-1. SSL証明書の設定（HTTPS化）

#### Let's Encryptを使用した無料SSL証明書

**前提条件**: ドメイン名を取得している場合のみ可能

1. **Certbotのインストール**
```bash
sudo apt install -y certbot
```

2. **ドメインのDNS設定**
   - ドメインのAレコードをElastic IPに向ける
   - 例: `moneypath.example.com` → `<Elastic IP>`

3. **証明書の取得**
```bash
sudo certbot certonly --standalone -d moneypath.example.com
```

4. **Nginxのセットアップ**（リバースプロキシ）
```bash
sudo apt install -y nginx

# Nginx設定ファイルを作成
sudo nano /etc/nginx/sites-available/moneypath
```

以下の内容を貼り付け:
```nginx
server {
    listen 80;
    server_name moneypath.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name moneypath.example.com;

    ssl_certificate /etc/letsencrypt/live/moneypath.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/moneypath.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Nginxの有効化**
```bash
sudo ln -s /etc/nginx/sites-available/moneypath /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **NEXTAUTH_URLの更新**
```bash
nano .env.production
# NEXTAUTH_URL=https://moneypath.example.com に変更

# アプリ再起動
docker-compose -f docker-compose.prod.yml restart app
```

### 6-2. 自動起動の設定
```bash
# システム起動時にDocker Composeを自動起動
sudo nano /etc/systemd/system/moneypath.service
```

以下の内容を貼り付け:
```ini
[Unit]
Description=MoneyPath Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/moneypath
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=ubuntu

[Install]
WantedBy=multi-user.target
```

有効化:
```bash
sudo systemctl daemon-reload
sudo systemctl enable moneypath.service
sudo systemctl start moneypath.service
```

### 6-3. バックアップ設定

**データベースの定期バックアップ**:
```bash
# バックアップスクリプトを作成
nano ~/backup-db.sh
```

以下の内容を貼り付け:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/moneypath_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# MySQLコンテナからバックアップ
docker-compose -f /home/ubuntu/moneypath/docker-compose.prod.yml exec -T db \
  mysqldump -u root -p$MYSQL_ROOT_PASSWORD moneypath > $BACKUP_FILE

# 7日以上古いバックアップを削除
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

実行権限を付与:
```bash
chmod +x ~/backup-db.sh
```

Cronで毎日実行:
```bash
crontab -e
```

以下を追加（毎日午前3時に実行）:
```
0 3 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backup.log 2>&1
```

### 6-4. モニタリング設定

**CloudWatch Agentのインストール**（オプション）:
```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

---

## トラブルシューティング

### アプリが起動しない
```bash
# ログを確認
docker-compose -f docker-compose.prod.yml logs app

# データベース接続確認
docker-compose -f docker-compose.prod.yml exec app npx prisma db push
```

### データベースに接続できない
```bash
# MySQLコンテナの状態確認
docker-compose -f docker-compose.prod.yml ps

# MySQLコンテナに直接接続
docker-compose -f docker-compose.prod.yml exec db mysql -u root -p
```

### ポート3000にアクセスできない
```bash
# セキュリティグループ設定を確認
# EC2ダッシュボード → セキュリティグループ → インバウンドルール
# ポート3000が0.0.0.0/0に開放されているか確認
```

### Dockerコンテナが再起動を繰り返す
```bash
# コンテナのログを確認
docker-compose -f docker-compose.prod.yml logs app --tail=100

# 環境変数が正しく設定されているか確認
docker-compose -f docker-compose.prod.yml exec app env | grep DATABASE_URL
```

---

## メンテナンス

### アプリケーションの更新
```bash
cd ~/moneypath

# 最新コードを取得
git pull origin main

# 再ビルド＆再起動
docker-compose -f docker-compose.prod.yml up -d --build

# マイグレーション実行
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### ログの確認
```bash
# アプリケーションログ
docker-compose -f docker-compose.prod.yml logs app -f

# データベースログ
docker-compose -f docker-compose.prod.yml logs db -f

# 全てのログ
docker-compose -f docker-compose.prod.yml logs -f
```

### データベースのバックアップ（手動）
```bash
# バックアップ
docker-compose -f docker-compose.prod.yml exec db mysqldump -u root -p moneypath > backup_$(date +%Y%m%d).sql

# リストア
docker-compose -f docker-compose.prod.yml exec -T db mysql -u root -p moneypath < backup_20251206.sql
```

---

## セキュリティのベストプラクティス

### 1. SSH接続の強化
```bash
# パスワード認証を無効化
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no に変更

sudo systemctl restart sshd
```

### 2. ファイアウォールの設定
```bash
# UFWのインストール
sudo apt install -y ufw

# デフォルトポリシー
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 必要なポートのみ許可
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Next.js（本番ではNginx経由推奨）

# 有効化
sudo ufw enable
```

### 3. 環境変数の保護
```bash
# .env.productionのパーミッション変更
chmod 600 .env.production
```

### 4. 定期的なアップデート
```bash
# 自動セキュリティアップデート設定
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## コスト最適化のヒント

### 1. インスタンスの停止（使用しない時間帯）
```bash
# AWSコンソールからインスタンスを停止可能
# 停止中はEC2料金が発生しない（EBS料金のみ）
```

### 2. Elastic IPの適切な管理
- インスタンス停止時はElastic IPを解放（未使用時課金を防ぐ）
- 再起動時に再割り当て

### 3. CloudWatch無料枠の活用
- 基本的なメトリクスは無料
- カスタムメトリクスは課金対象

---

## まとめ

このガイドに従うことで、AWS EC2上にMoneyPathアプリケーションを本番環境としてデプロイできます。

**推定セットアップ時間**: 2〜3時間（初回）

**メリット**:
- ✅ 1年目はほぼ無料（AWS無料枠）
- ✅ AWSの実践的なスキル習得
- ✅ 本格的なインフラ運用経験
- ✅ スケールアップが容易

**デメリット**:
- ❌ セットアップが複雑
- ❌ 2年目以降は月4,200円程度の課金
- ❌ 運用・保守の知識が必要

何か問題が発生した場合は、トラブルシューティングセクションを参照してください。
