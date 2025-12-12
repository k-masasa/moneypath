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
