# Google Drive 動画連携ガイド

## 方法1: 埋め込みリンク方式（推奨・最も簡単）

### 手順
1. Google Driveで動画を右クリック → 「共有」
2. 「リンクを取得」→ 「制限付き」を「リンクを知っている全員」に変更
3. リンクをコピー

### URLの変換方法
```
通常のリンク:
https://drive.google.com/file/d/FILE_ID/view

埋め込み用URL:
https://drive.google.com/file/d/FILE_ID/preview

直接再生URL:
https://drive.google.com/uc?export=download&id=FILE_ID
```

### 実装例
```typescript
// 動画プレーヤーでの使用
const getGoogleDriveEmbedUrl = (shareUrl: string) => {
  // FILE_IDを抽出
  const match = shareUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const fileId = match[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return shareUrl;
};
```

## 方法2: Google Drive API（より高度な制御）

### 必要な設定
1. Google Cloud Consoleでプロジェクト作成
2. Google Drive APIを有効化
3. 認証情報（APIキーまたはOAuth2）を取得

### 実装例
```typescript
// Google Drive APIを使用した動画リスト取得
const listVideos = async () => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='video/mp4'&key=${API_KEY}`
  );
  return response.json();
};
```

## 方法3: 直接ストリーミング（制限あり）

### 注意点
- ファイルサイズ制限: 100MBまで
- 同時アクセス制限あり
- 大量アクセスでブロックされる可能性

### 実装例
```typescript
const getDirectStreamUrl = (fileId: string) => {
  return `https://drive.google.com/uc?export=stream&id=${fileId}`;
};
```

## 推奨実装プラン

### ステップ1: シンプルな埋め込み実装
1. 管理画面で Google Drive の共有リンクを入力
2. 自動的に埋め込み用URLに変換
3. iframeで動画を表示

### ステップ2: メタデータ管理
- 動画タイトル、説明、タグはデータベースで管理
- Google DriveのファイルIDのみを保存
- サムネイルは別途アップロード or 自動生成

### ステップ3: アクセス制御
- 講師のみがアクセスできるよう認証チェック
- Google Driveの共有設定は「リンクを知っている全員」でOK
- アプリ側で講師認証を実装

## セキュリティ考慮事項

1. **共有リンクの管理**
   - データベースに保存
   - フロントエンドに直接露出させない
   - APIエンドポイント経由でアクセス

2. **アクセス制御**
   - 講師認証必須
   - トークンベースの一時的なアクセス

3. **帯域制限**
   - Google Driveの制限に注意
   - キャッシュの活用

## コスト比較

| ストレージ | 月額料金 | 容量 |
|-----------|---------|------|
| Google Drive 無料 | ¥0 | 15GB |
| Google One Basic | ¥250 | 100GB |
| Google One Standard | ¥380 | 200GB |
| Google One Premium | ¥1,300 | 2TB |
| Supabase Pro | ¥3,200 | 100GB |

## 実装優先順位

1. ✅ Google Drive共有リンクの入力フィールド追加
2. ✅ 埋め込みURL自動変換機能
3. ⬜ 動画プレーヤーページの改修
4. ⬜ メタデータ管理システム
5. ⬜ 視聴履歴・分析機能