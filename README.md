# スポぐり講師向け管理アプリ / Spogli Coach Management App

スポーツイングリッシュプログラム「スポぐり」の講師が、レッスン管理・生徒評価・教材アクセス・講師シフト管理を一元的に行える総合管理アプリケーションです。

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + shadcn/ui
- **データベース**: Supabase (PostgreSQL + Auth)
- **メール**: Resend
- **メッセージング**: LINE Bot SDK
- **デプロイ**: Vercel
- **状態管理**: React Hooks

## 📋 機能概要

### Phase 1: 基盤構築 ✅
- ✅ 認証システム（ログイン/ログアウト）
- ✅ データベーススキーマ設計
- ✅ 共通UIコンポーネント
- ✅ レスポンシブレイアウト（Header, Sidebar, Nav）

### Phase 2: 講師・スケジュール管理 ✅
- ✅ 講師CRUD機能
- ✅ 資格管理・期限アラート
- ✅ シフト管理基盤
- ✅ スケジュール管理画面

### Phase 3: 生徒・評価管理 ✅
- ✅ 生徒CRUD機能（一覧・詳細・編集・削除）
- ✅ ミッションシート作成・管理
- ✅ スキルチェック・星評価システム
- ✅ バッジ管理・授与フロー

### Phase 4: コンテンツ・メニュー管理 ✅
- ✅ 動画ライブラリ管理
- ✅ レッスンメニューテンプレート
- ✅ バッジシステム完成
- ✅ コンテンツカテゴリ分け

### Phase 5: 通知・連携・印刷 ✅
- ✅ 通知システム（バッジ・資格アラート）
- ✅ LINE送信機能（Bot連携）
- ✅ メール送信機能（Resend）
- ✅ 全画面印刷対応

### Phase 6: スポーツ概要・ダッシュボード・最終調整 ✅
- ✅ スポーツ概要・目標表示・編集
- ✅ ダッシュボード完成（統計・グラフ）
- ✅ 全体テスト・バグ修正
- ✅ デプロイ準備

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
`.env.example`を`.env.local`にコピーして、必要な環境変数を設定してください。

```bash
cp .env.example .env.local
```

必要な環境変数:
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `RESEND_API_KEY`: Resend APIキー
- `LINE_CHANNEL_ACCESS_TOKEN`: LINE Botアクセストークン
- `LINE_CHANNEL_SECRET`: LINE Botシークレット

### 4. データベースのセットアップ
Supabaseダッシュボードで、`supabase/migrations/`内のSQLを実行してください。

### 5. 開発サーバーの起動
```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📁 プロジェクト構成

```
spogli-coach-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # メインアプリケーション
│   └── api/               # APIルート
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/uiコンポーネント
│   ├── print/            # 印刷用コンポーネント
│   └── line/             # LINE連携コンポーネント
├── hooks/                 # カスタムReact Hooks
├── lib/                   # ユーティリティ
│   ├── supabase/         # Supabaseクライアント
│   ├── email.ts          # メールサービス
│   └── line.ts           # LINE Botサービス
├── types/                 # TypeScript型定義
└── styles/               # グローバルスタイル
```

## 🎯 主要機能

### ダッシュボード
- リアルタイム統計表示
- 今日のレッスン一覧
- バッジ付与アラート
- 資格期限通知
- クイックアクション

### 講師管理
- 講師プロフィール管理
- 資格・認定証管理
- スケジュール管理
- パフォーマンス評価

### 生徒管理
- 生徒情報管理
- 進捗追跡
- 評価履歴
- バッジ獲得状況

### レッスン管理
- レッスンメニューテンプレート
- アクティビティ計画
- 器具管理
- 共有機能

### 通知システム
- マルチチャンネル配信（アプリ・メール・LINE・SMS）
- テンプレートベースのメッセージ
- 優先度設定
- ユーザー設定管理

### スポーツ管理
- スポーツプロフィール
- スキル定義
- 目標追跡
- 器具管理

## 📱 LINE Bot設定

1. LINE Developer Consoleでボット作成
2. Channel Access TokenとChannel Secret取得
3. 環境変数に設定
4. Webhook URL設定: `https://your-domain.com/api/line/webhook`
5. Webhook有効化、自動返信無効化

## 📧 メール設定

1. Resendアカウント作成
2. ドメイン認証
3. APIキー取得
4. 環境変数に設定

## 🖨️ 印刷機能

- レッスンメニュー印刷
- 生徒評価シート
- バッジ証明書
- 進捗レポート
- カスタム印刷レイアウト

## 🔒 セキュリティ

- Row Level Security (RLS) in Supabase
- ロールベースアクセス制御
- APIエンドポイント保護
- 環境変数保護
- 入力検証とサニタイズ

## 🚀 デプロイ

### Vercel (推奨)
1. GitHubにプッシュ
2. Vercelでプロジェクトインポート
3. 環境変数設定
4. デプロイ

## 📝 開発状況

### 全フェーズ完了 ✅
- ✅ Phase 1: 基盤構築
- ✅ Phase 2: 講師・スケジュール管理
- ✅ Phase 3: 生徒・評価管理
- ✅ Phase 4: コンテンツ・メニュー管理
- ✅ Phase 5: 通知・連携・印刷
- ✅ Phase 6: スポーツ概要・ダッシュボード

### アプリケーション状態
- **Version:** 6.0.0 (全フェーズ完了)
- **状態:** Production Ready
- **最終更新:** 2025年1月17日

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [Resend](https://resend.com/)
- [LINE](https://developers.line.biz/)

---

**Spogli Coach Management App** - スポーツコーチングをデジタルツールでサポート 🏆# Deploy trigger #午後
