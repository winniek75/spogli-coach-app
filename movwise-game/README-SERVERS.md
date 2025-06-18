# MovWISE サーバー起動ガイド

## 🚀 協力学習機能の使用方法

### 必要なサーバー

1. **Vue.js開発サーバー** (ポート 3000) - メインアプリケーション
2. **WebSocketサーバー** (ポート 3001) - 協力学習セッション

### 起動手順

#### 1️⃣ WebSocketサーバーの起動

```bash
# WebSocketサーバー用のpackage.jsonに切り替え
cp server-package.json package.json

# 依存関係をインストール
npm install

# サーバー起動
node server.cjs
```

#### 2️⃣ Vue.js開発サーバーの起動

**別のターミナルで:**

```bash
# Vue.js用のpackage.jsonに切り替え
cp package-vue.json package.json

# 依存関係をインストール
npm install --legacy-peer-deps

# 開発サーバー起動
npm run dev
```

### 🌐 アクセスURL

- **講師ダッシュボード**: http://localhost:3000/teacher-dashboard
- **生徒セッション**: http://localhost:3000/student-session
- **招待リンク例**: http://localhost:3000/join-session/[招待コード]

### 🎯 使用方法

1. 講師がTeacher Dashboardで「協力学習セッション開始」をクリック
2. 招待コードが生成される
3. 生徒がそのコードでセッションに参加
4. リアルタイムで画面共有・指導が可能

### ⚠️ 注意事項

- 両方のサーバーが起動している必要があります
- WebSocketサーバー: `ws://localhost:3001`
- Webアプリケーション: `http://localhost:3000`

### 🔧 トラブルシューティング

#### ポートが使用中の場合:
```bash
# ポート3000のプロセスを停止
lsof -ti:3000 | xargs kill -9

# ポート3001のプロセスを停止
lsof -ti:3001 | xargs kill -9
```

#### 依存関係エラーの場合:
```bash
# Viteキャッシュをクリア
rm -rf node_modules/.vite

# 依存関係を再インストール
npm install --legacy-peer-deps
```