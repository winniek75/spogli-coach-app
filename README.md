# スポぐり講師向け管理アプリ / Spogli Coach Management App

スポーツイングリッシュプログラム「スポぐり」の講師が、レッスン管理・生徒評価・教材アクセス・講師シフト管理を一元的に行える総合管理アプリケーションです。

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS + shadcn/ui
- **データベース**: Supabase (PostgreSQL + Auth)
- **デプロイ**: Vercel
- **状態管理**: React Context

## 📋 機能概要

### Phase 1: 基盤構築 ✅
- [x] 認証システム（ログイン/ログアウト）
- [x] データベーススキーマ設計
- [x] 共通UIコンポーネント
- [x] レスポンシブレイアウト（Header, Sidebar, Nav）

### Phase 2: 講師・スケジュール管理（開発予定）
- [ ] 講師CRUD機能
- [ ] 資格管理・期限アラート
- [ ] シフト管理カレンダー
- [ ] レッスンスケジュール自動アサイン

### Phase 3: 生徒・評価管理（開発予定）
- [ ] 生徒CRUD機能
- [ ] ミッションシート作成
- [ ] スキルチェック・星評価
- [ ] バッジ管理・授与フロー

## 🛠️ セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/winniek75/spogli-coach-app.git
cd spogli-coach-app
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local.example`を`.env.local`にコピーして、必要な環境変数を設定してください。

```bash
cp .env.local.example .env.local
```

必要な環境変数:
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー

### 4. データベースのセットアップ
Supabaseダッシュボードで、`supabase/migrations/001_initial_schema.sql`のSQLを実行してください。

### 5. 開発サーバーの起動
```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📝 開発状況

### 完了済み
- ✅ プロジェクト初期化
- ✅ Supabase連携
- ✅ 認証システム
- ✅ データベーススキーマ
- ✅ 基本レイアウト
- ✅ ダッシュボード画面

### 開発中
- 🚧 講師管理機能
- 🚧 生徒管理機能

---

**Version:** 1.0.0
**最終更新:** 2025年1月17日
