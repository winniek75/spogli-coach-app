# MovWise Game - Vercel デプロイメントガイド

## 🚀 GitHub経由でVercelにデプロイする手順

### 1. GitHubにコードをプッシュ

```bash
# 変更をステージング
git add .

# コミット
git commit -m "Add Vercel deployment configuration"

# GitHubにプッシュ
git push origin main
```

### 2. Vercelアカウントの設定

1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでサインアップ/ログイン
3. "Import Git Repository" をクリック

### 3. プロジェクトのインポート

1. GitHubからリポジトリ `movwise-game` を選択
2. プロジェクト設定：
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (デフォルト)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4. 環境変数の設定 (重要!)

Vercelダッシュボードで以下の環境変数を設定してください：

#### 必須の環境変数:

```
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Stripe (本番環境キーを使用)
VITE_STRIPE_PUBLIC_KEY=pk_live_your_live_public_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_starter_monthly_live
STRIPE_PRICE_PRO=price_pro_monthly_live
STRIPE_PRICE_FAMILY=price_family_monthly_live
STRIPE_PRICE_ENTERPRISE=price_enterprise_monthly_live

# Security
JWT_SECRET=your_secure_random_jwt_secret
SESSION_SECRET=your_secure_random_session_secret

# API設定
VITE_API_BASE_URL=https://your-app-name.vercel.app
PRODUCTION_DOMAIN=your-app-name.vercel.app

# Email (オプション)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
```

### 5. デプロイの実行

1. "Deploy" ボタンをクリック
2. 初回デプロイが完了するまで待機 (約5-10分)
3. デプロイURL（例：`https://movwise-game.vercel.app`）を確認

### 6. ドメインの設定 (オプション)

独自ドメインを使用する場合：
1. Vercelダッシュボード → Settings → Domains
2. カスタムドメインを追加
3. DNSレコードを設定

## 🔧 あなたがやる必要があること

### A. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. Authentication、Realtime Database を有効化
3. API キーを取得して環境変数に設定

### B. Stripe設定

1. [Stripe Dashboard](https://dashboard.stripe.com/) でアカウント作成
2. 本番環境のAPIキーを取得
3. 料金プラン (Price Objects) を作成
4. Webhookエンドポイントを設定：
   - URL: `https://your-app.vercel.app/api/stripe-webhook`
   - イベント: `checkout.session.completed`, `invoice.payment_succeeded`

### C. 環境変数の準備

`.env.vercel` ファイルを参考に、以下を準備：
- Firebase設定値
- Stripe本番環境キー
- ランダムなJWT/Sessionシークレット

## 📋 デプロイ後の確認事項

### 1. 動作確認
- [ ] サイトが正常に表示される
- [ ] Firebase認証が動作する
- [ ] ゲームが正常にロードされる
- [ ] 決済機能が正常に動作する

### 2. パフォーマンス確認
- [ ] Lighthouse スコアが80以上
- [ ] 画像・音声が適切に配信される
- [ ] モバイルで正常に動作する

### 3. セキュリティ確認
- [ ] HTTPS で配信される
- [ ] API キーが適切に保護されている
- [ ] CSRFプロテクションが有効

## 🚨 トラブルシューティング

### Build エラーが発生する場合
```bash
# ローカルでビルドテスト
npm run build

# 依存関係の確認
npm ci
```

### Environment Variables エラー
- Vercelダッシュボードで環境変数が正しく設定されているか確認
- 変数名にタイプミスがないか確認

### API Routes が動作しない
- `api/` ディレクトリのファイルが正しくプッシュされているか確認
- サーバーレス関数の制限時間（30秒）を確認

## 🔄 継続的デプロイメント

GitHubの `main` ブランチにプッシュすると自動的にVercelにデプロイされます：

```bash
git add .
git commit -m "Update feature"
git push origin main
# → 自動的にVercelでビルド・デプロイが開始
```

## 📞 サポート

問題が発生した場合：
1. Vercelダッシュボードのデプロイログを確認
2. Functionログでエラーメッセージを確認
3. 必要に応じてVercelサポートに連絡