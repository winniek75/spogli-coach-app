# Supabase データベース設定ガイド

## 📝 簡単セットアップ手順

### ステップ 1: Supabaseにログイン
1. ブラウザで https://supabase.com を開く
2. 右上の「Dashboard」をクリック
3. ログインする（まだアカウントがない場合は「Sign up」で作成）

### ステップ 2: SQL Editorを開く
1. 左側メニューから「SQL Editor」をクリック
2. 「New query」ボタンをクリック

### ステップ 3: データベーステーブルを作成
1. 下記のコードをすべてコピー：
   - `/supabase/migrations/001_initial_schema.sql` の内容
2. SQL Editorに貼り付け
3. 右下の「Run」ボタンをクリック
4. 「Success」と表示されれば成功！

### ステップ 4: リレーション設定を追加
1. 「New query」ボタンをもう一度クリック
2. 下記のコードをすべてコピー：
   - `/supabase/migrations/002_fix_relations.sql` の内容
3. SQL Editorに貼り付け
4. 「Run」ボタンをクリック

### ステップ 5: サンプルデータを追加（オプション）
テスト用のデータが欲しい場合：
1. 「New query」ボタンをクリック
2. `/supabase/seed.sql` の内容をコピー＆貼り付け
3. 「Run」ボタンをクリック

### ステップ 6: 環境変数を確認
1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の値をメモ：
   - Project URL
   - anon public key
3. `.env.local`ファイルに記載されているか確認

```
NEXT_PUBLIC_SUPABASE_URL=あなたのProject URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanon public key
```

## ✅ 設定完了！
ブラウザで http://localhost:3000 を開いて、生徒ページで新規登録・編集ができるようになりました。

## 🆘 トラブルシューティング

### エラーが出る場合
- SQL実行時にエラーが出たら、エラーメッセージをコピーして教えてください
- 「Table already exists」エラーは無視してOK（すでにテーブルがある証拠）

### データが表示されない場合
1. ブラウザのキャッシュをクリア（Cmd+Shift+R）
2. 開発サーバーを再起動（ターミナルでCtrl+C → npm run dev）