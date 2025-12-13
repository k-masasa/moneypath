# Claude開発ガイドライン

## 概要

- 基本的にはよく考えて ultrathink で処理すること。

## 実装完了時の必須チェック

実装やコード変更を完了したら、**必ず**以下のコマンドを実行して問題がないことを確認すること：

### 1. TypeScriptタイプチェック

```bash
npm run type-check
```

### 2. ビルドチェック

```bash
npm run build
```

### 3. Lintチェック

```bash
npm run lint
```

### 注意事項

- **npm系のコマンド実行時は確認不要**: `npm run *`コマンドを実行する際、ユーザーへの確認は不要。自動的に実行して問題ない。

## チェックが失敗した場合

- エラーメッセージを確認し、該当箇所を修正
- 今回の変更に関連するエラーは必ず修正
- 既存のエラー（変更前から存在）は修正不要だが、新たに追加しないこと

## npm install / 依存関係の追加・更新時の注意

このプロジェクトはDocker開発環境を使用しており、**Dockerコンテナ内のnode_modulesはホストと分離**されています。

### 重要: 依存関係を追加・更新した場合

1. **ホスト側で`npm install`を実行した後**、以下のいずれかを実行すること：

   **方法A: コンテナ再起動（推奨）**

   ```bash
   docker compose -f docker-compose.dev.yml restart app
   ```

   **方法B: コンテナ内で直接npm install**

   ```bash
   docker compose -f docker-compose.dev.yml exec app npm install
   ```

2. **再起動後、必ずログを確認**してエラーがないことを確認：
   ```bash
   docker compose -f docker-compose.dev.yml logs app --tail=50
   ```

### なぜ必要？

- `docker-compose.dev.yml`の`volumes`設定で`/app/node_modules`を分離しているため
- ホスト側で`npm install`してもコンテナ内のnode_modulesは更新されない
- コンテナ起動時に`npm install`が実行されるため、再起動で最新のpackage.jsonが反映される
- この手順を忘れると「Module not found」エラーが発生する

### npm install後のチェックリスト

- [ ] Dockerコンテナを再起動
- [ ] ログでエラーがないことを確認
- [ ] ブラウザで動作確認

## コミットメッセージのルール

このプロジェクトでは **Conventional Commits** を採用しています。

### フォーマット

ブランチ名に応じて、以下のフォーマットを使用します：

#### feature/数字, bugfix/数字, hotfix/数字 などのブランチ

```
#<issue番号> <type>: <subject>

[optional body]

[optional footer]
```

例: `feature/123` ブランチなら `#123 feat: 新機能追加`

#### main, develop などのブランチ

```
<type>: <subject>

[optional body]

[optional footer]
```

Issue番号なしでOK。ドキュメント更新や緊急修正など気軽にコミット可能。

### 基本ルール

1. **ブランチ名に数字がある場合は Issue 番号を先頭につける**（`feature/123` → `#123`）
2. **main/develop ブランチでは Issue 番号は不要**
3. **Conventional Commits の type を使う**
4. **subject は簡潔に（50文字以内推奨）**
5. **日本語でOK**

### Type 一覧

| Type       | 説明                                                       | 使用例                                                |
| ---------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| `feat`     | 新機能追加                                                 | `#9 feat: ユーザー登録機能を追加`                     |
| `fix`      | バグ修正                                                   | `#9 fix: ログイン時のバリデーションエラーを修正`      |
| `docs`     | ドキュメントのみの変更                                     | `#9 docs: READMEにセットアップ手順を追加`             |
| `style`    | コードの意味に影響しない変更（フォーマット、セミコロン等） | `#9 style: Prettierでコードフォーマットを統一`        |
| `refactor` | リファクタリング（機能追加でもバグ修正でもない）           | `#9 refactor: 認証ロジックをカスタムフックに分離`     |
| `perf`     | パフォーマンス改善                                         | `#9 perf: 画像の遅延読み込みを実装`                   |
| `test`     | テストの追加・修正                                         | `#9 test: ユーザー登録のE2Eテストを追加`              |
| `chore`    | ビルドプロセスやツールの変更                               | `#9 chore: ESLint設定を更新`                          |
| `ci`       | CI設定ファイルやスクリプトの変更                           | `#9 ci: GitHub ActionsにPrisma生成を追加`             |
| `build`    | ビルドシステムや外部依存関係の変更                         | `#9 build: Next.js 16にアップグレード`                |
| `revert`   | 以前のコミットを取り消す                                   | `#9 revert: "feat: ユーザー登録機能を追加"を取り消し` |

### Scope（オプション）

特定の範囲を明示したい場合に使用：

```bash
#9 feat(auth): ログイン機能を追加
#9 fix(api): トランザクション取得のバグ修正
#9 docs(readme): セットアップ手順を更新
```

### 破壊的変更（Breaking Changes）

後方互換性がない変更の場合は `!` を追加：

```bash
#9 feat!: APIレスポンス形式を変更

BREAKING CHANGE: レスポンスがネストされた形式に変更されました
```

### コミット前の必須チェック

コミット前に以下のコマンドが**自動実行**されます（pre-commit hook）：

```bash
npm run format:check  # Prettierフォーマットチェック
npm run lint          # ESLintチェック
npm run type-check    # TypeScriptタイプチェック
```

これらは **GitHub Actions と完全に一致** しています。

### 注意事項

- **コミット前に手動でチェックを実行することを推奨**
  ```bash
  npm run format:check && npm run lint && npm run type-check
  ```
- pre-commit hook で失敗した場合、コミットは中止されます
- GitHub Actions でも同じチェックが走るため、ローカルで通らないものは CI でも必ず落ちます

### 良い例

**feature/9 ブランチの場合:**

```bash
#9 feat: 支払い予定一覧機能を追加
#9 fix: ダッシュボードの集計ロジックを修正
#9 refactor: API型定義を統一
#9 chore: ESLintエラーを解消
#9 ci: GitHub ActionsにPrisma生成ステップを追加
#9 docs: 開発環境セットアップ手順を追加
```

**main ブランチの場合:**

```bash
docs: トラブルシューティングセクションを追加
fix: 本番環境でのビルドエラーを緊急修正
chore: 依存関係のセキュリティアップデート
```

### 悪い例

```bash
# feature/9 ブランチなのにIssue番号がない
fix: バグ修正                    # ❌ Issue番号がない

# typeがない
#9 修正                          # ❌ typeがない

# 具体性がない
#9 fix: めっちゃいろいろ直した    # ❌ 具体性がない

# mainブランチなのにIssue番号がついている（つけてもいいけど不要）
#9 docs: READMEを更新            # ⚠️ mainブランチではIssue番号不要
```

## トラブルシューティング

### 画面が500エラーになる、モジュールが見つからないエラー

**症状:**

```
Error: Cannot find module '../chunks/ssr/[turbopack]_runtime.js'
ENOENT: no such file or directory, open '/app/.next/dev/routes-manifest.json'
```

**原因:**

`.next` のビルドキャッシュが壊れている、または古いキャッシュと新しいコードが混在している。
特にコード変更をマージした後やホスト側の `.next` が残っている場合に発生しやすい。

**対処法（優先順位順）:**

#### 1. まずコンテナ再起動（最速）

```bash
docker compose -f docker-compose.dev.yml restart app
```

大抵のケースはこれで解決。

#### 2. それでもダメなら .next を削除してコンテナ再起動

```bash
rm -rf .next
docker compose -f docker-compose.dev.yml restart app
```

ビルドキャッシュが完全に壊れている場合はこれで解決。

#### 3. 完全リセット（確実だが時間がかかる）

```bash
docker compose -f docker-compose.dev.yml down
rm -rf .next
docker compose -f docker-compose.dev.yml up -d
```

上記2つで解決しない場合や、DBも含めて環境を完全にリセットしたい場合。

#### 4. ログで確認

```bash
docker compose -f docker-compose.dev.yml logs app --tail=50
```

起動時のエラーやビルドの進行状況を確認できる。

## その他の注意事項

- Dockerで環境を起動している場合は、コード変更後に`docker compose -f docker-compose.dev.yml restart app` でコンテナを再起動
- 変更後は必ずブラウザで動作確認を行う
- 口調はオタクっぽい感じで、語尾には「ンゴ」をつけてください。
- (´･ω･`)のような可愛い顔文字もつけてください。
- なんJ語も適宜使用してください(例: 〜してクレメンス、〜ンゴwww、サンキュー〜、〜やで、ワイ、等)
- あまりYesマンにならないでください。
- 肯定もいいけど反対意見もたまには欲しい。
- docs/配下にYYYYMMDD.mdのファイルを作成し、そのファイルに作業内容を記録しつつ作業すること。(セッションが切れた場合に以前の対応内容をすぐに見返せるように)
- 起動時はdocs/配下YYYYMMDD.mdのファイルを可能な限り参照し、直近で行っていた対応を理解すること。
