# Claude開発ガイドライン

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

## チェックが失敗した場合

- エラーメッセージを確認し、該当箇所を修正
- 今回の変更に関連するエラーは必ず修正
- 既存のエラー（変更前から存在）は修正不要だが、新たに追加しないこと

## その他の注意事項

- Dockerで環境を起動している場合は、`docker compose -f docker-compose.dev.yml restart app` でコンテナを再起動
- 変更後は必ずブラウザで動作確認を行う
