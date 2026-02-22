# Supabase データベース設定ガイド

このガイドでは、Supabaseのデータベースを設定して、複数デバイス間でデータを同期できるようにする手順を説明します。

## 前提条件
- Supabaseアカウントが作成済み
- プロジェクトが作成済み（URL: yefdgxiasmbrqkyjwhsn.supabase.co）

## 設定手順

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクト `yefdgxiasmbrqkyjwhsn` を開く

### 2. データベーススキーマの作成

1. 左サイドバーの **SQL Editor** をクリック
2. **New Query** ボタンをクリック
3. 以下のSQLファイルの内容を実行：

#### 完全スキーマ作成（推奨）
`supabase/migrations/004_fixed_create_all_tables.sql` の内容を全てコピー＆ペーストして実行

このファイルは：
- 依存関係を考慮した正しい順序でテーブルを作成
- `IF NOT EXISTS` を使用して安全に実行可能
- 開発環境用のRLSポリシーも含む

**注意**: 本番環境では適切なRLSポリシーを設定してください。

### 3. データベース接続の確認

SQL Editorで以下のクエリを実行して、テーブルが作成されたことを確認：

```sql
-- テーブル一覧を確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

以下のテーブルが表示されれば成功です：
- students
- coaches
- evaluations (student_evaluations)
- badges
- lesson_menus
- contents (videos/pdf_materials)
- 他

### 4. 環境変数の確認

`.env.local` ファイルに以下の環境変数が設定されていることを確認：

```env
NEXT_PUBLIC_SUPABASE_URL=https://yefdgxiasmbrqkyjwhsn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZmRneGlhc21icnFreWp3aHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MzcwNDcsImV4cCI6MjA4NDIxMzA0N30.1YhrvSfhTuA1PWuBGfaUnH6e0Jdt5pbyDcM4RsA_o1A
```

### 5. アプリケーションの再起動

```bash
# 開発サーバーを再起動
npm run dev
```

### 6. 動作確認

1. ブラウザで https://spoglicoachapp.vercel.app/ja/students にアクセス
2. 新規生徒を登録
3. 別のデバイスまたはブラウザで同じURLにアクセス
4. 登録した生徒が表示されることを確認

## トラブルシューティング

### エラー: "relation does not exist"
→ SQLスキーマが正しく実行されていません。手順2を再実行してください。

### エラー: "permission denied"
→ RLSポリシーの設定に問題があります。開発環境では `002_disable_rls_for_dev.sql` を実行してください。

### データが同期されない
1. ネットワークタブ（F12）でAPIリクエストを確認
2. `/api/students` へのリクエストが成功しているか確認
3. コンソールにエラーが表示されていないか確認

### ローカルストレージが使用されている
→ `hooks/use-students.ts` などのフックファイルで `isLocalStorageMode()` が常にfalseを返すようにしてください。

## 本番環境への移行

本番環境では以下の設定を必ず行ってください：

1. **認証の有効化**
   - Supabase Authenticationを設定
   - ユーザー登録・ログイン機能を実装

2. **RLSポリシーの適切な設定**
   - 各テーブルに適切なアクセス制御を設定
   - ユーザーの役割に応じた権限管理

3. **環境変数の分離**
   - 本番用のSupabaseプロジェクトを作成
   - 本番用の環境変数を設定

## 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase Tutorial](https://supabase.com/docs/guides/with-nextjs)