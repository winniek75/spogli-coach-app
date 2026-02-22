# Google Drive画像統合ガイド

## 概要

Google Driveの画像を使用することで、サーバーの容量を消費せずに生徒の写真、動画のサムネイル、その他の画像を管理できます。

## 実装済み機能

### 1. 動画サムネイル
- 動画アップロード時にGoogle Driveのサムネイルを設定可能
- 自動的に適切なサイズ（400px）に変換

### 2. 生徒プロフィール写真
- 新規生徒作成時にGoogle Driveから写真を設定
- 既存生徒の編集でも対応
- リアルタイムプレビュー機能

### 3. 自動URL変換
- 共有リンクを画像直接表示用URLに自動変換
- 複数のURL形式に対応

## 使用方法

### Google Drive側の設定
1. Google Driveで画像ファイルを右クリック
2. 「共有」をクリック
3. 「リンクを取得」で「制限付き」を「**リンクを知っている全員**」に変更
4. 「リンクをコピー」

### システムでの使用
1. 各種フォームでGoogle Drive URLフィールドに貼り付け
2. 自動的に表示用URLに変換される
3. プレビューで確認可能

## URL変換例

```typescript
// 入力された共有URL
https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing

// 自動変換された表示用URL
https://drive.google.com/uc?export=view&id=1ABC123xyz&s=400
```

## サイズ変換オプション

| サイズ | ピクセル | 用途 |
|--------|----------|------|
| 's' | 200px | アバター・小さいアイコン |
| 'm' | 400px | サムネイル・プロフィール写真 |
| 'l' | 800px | 詳細表示 |
| 'xl' | 1600px | 高解像度表示 |

## 実装詳細

### ユーティリティ関数

```typescript
import {
  convertGoogleDriveImageUrl,
  isGoogleDriveUrl,
  getGoogleDriveThumbnailUrl
} from '@/lib/google-drive-utils'

// Google Drive画像URLに変換
const imageUrl = convertGoogleDriveImageUrl(driveUrl, 'm')

// サムネイル用（400px）
const thumbnailUrl = getGoogleDriveThumbnailUrl(driveUrl)
```

### コンポーネント使用例

```tsx
import { GoogleDriveImage, GoogleDriveAvatar } from '@/components/ui/google-drive-image'

// 通常の画像表示
<GoogleDriveImage
  src={student.photo_url}
  alt={student.name}
  size="m"
  className="w-full h-full object-cover"
/>

// アバター表示
<GoogleDriveAvatar
  src={student.photo_url}
  alt={student.name}
  size={40}
  fallback={<div>No Photo</div>}
/>
```

## セキュリティ・制限事項

### 制限事項
1. **共有設定必須**: ファイルは「リンクを知っている全員」で共有する必要あり
2. **帯域制限**: Google Driveの制限により、大量アクセス時に制限される可能性
3. **ファイル形式**: 画像ファイル（JPG, PNG, GIF, WebP）のみ対応

### セキュリティ考慮事項
1. **アクセス制御**: アプリ側で講師認証を実装
2. **URL管理**: 共有URLはデータベースで管理
3. **プライバシー**: 生徒の写真は適切な共有設定で管理

## 容量・コスト比較

| ストレージ | 月額料金 | 容量 | 画像枚数（約） |
|-----------|---------|------|----------------|
| Google Drive 無料 | ¥0 | 15GB | 約15,000枚 |
| Google One Basic | ¥250 | 100GB | 約100,000枚 |
| Supabase Pro | ¥3,200 | 100GB | 約100,000枚 |

*画像1枚あたり1MB想定

## トラブルシューティング

### 画像が表示されない場合
1. **共有設定の確認**: 「リンクを知っている全員」になっているか
2. **URL形式の確認**: Google DriveのURLかどうか
3. **ファイル形式の確認**: 対応している画像形式か

### パフォーマンス問題
1. **キャッシュの活用**: ブラウザキャッシュを有効化
2. **サイズ最適化**: 適切なサイズパラメータを使用
3. **CDN検討**: 大量アクセス時はCloudflare等のCDN使用を検討

## 今後の拡張予定

1. **一括アップロード**: 複数画像の一括設定
2. **自動サムネイル生成**: 動画から自動でサムネイル生成
3. **画像最適化**: 自動リサイズ・圧縮機能
4. **フォルダ管理**: Google Driveフォルダとの連携