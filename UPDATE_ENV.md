# 環境変数の更新手順

## 1. Supabaseの設定画面を開く
- Supabaseダッシュボードの左メニューから「Settings」をクリック
- 「API」セクションをクリック

## 2. 以下の値をコピー
- **Project URL**: あなたのプロジェクトURL
- **anon public key**: 公開用APIキー

## 3. `.env.local`ファイルを更新

現在の内容：
```
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

以下のように更新：
```
NEXT_PUBLIC_SUPABASE_URL=（あなたのProject URLをここに貼り付け）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（あなたのanon public keyをここに貼り付け）
```

## 4. サーバーを再起動
ターミナルで：
1. `Ctrl + C` で停止
2. `npm run dev` で再起動

これで接続が完了します！