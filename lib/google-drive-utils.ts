/**
 * Google Drive関連のユーティリティ関数
 */

/**
 * Google DriveのファイルIDを抽出する
 * @param url - Google Driveの共有URL
 * @returns ファイルID または null
 */
export const extractGoogleDriveFileId = (url: string): string | null => {
  // 様々なGoogle Drive URLパターンに対応
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,      // 通常のファイル共有URL
    /id=([a-zA-Z0-9-_]+)/,             // 直接IDが含まれる場合
    /\/([a-zA-Z0-9-_]+)\/view/,        // view付きURL
    /open\?id=([a-zA-Z0-9-_]+)/,       // open形式
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Google Drive URLを動画埋め込み用に変換
 * @param url - Google Driveの共有URL
 * @returns 埋め込み用URL
 */
export const convertGoogleDriveVideoUrl = (url: string): string => {
  const fileId = extractGoogleDriveFileId(url)
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`
  }
  return url
}

/**
 * Google Drive URLを画像直接表示用に変換
 * @param url - Google Driveの共有URL
 * @param size - 画像サイズ (オプション: 's' | 'm' | 'l' | 'xl' | number)
 * @returns 画像直接表示用URL
 */
export const convertGoogleDriveImageUrl = (url: string, size?: 's' | 'm' | 'l' | 'xl' | number): string => {
  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) {
    return url
  }

  // サイズパラメータの変換
  let sizeParam = ''
  if (size) {
    if (typeof size === 'number') {
      sizeParam = `=s${size}`
    } else {
      const sizeMap = {
        's': '=s200',   // 200px
        'm': '=s400',   // 400px
        'l': '=s800',   // 800px
        'xl': '=s1600', // 1600px
      }
      sizeParam = sizeMap[size]
    }
  }

  return `https://drive.google.com/uc?export=view&id=${fileId}${sizeParam}`
}

/**
 * Google Drive URLかどうかを判定
 * @param url - 判定するURL
 * @returns Google Drive URLの場合true
 */
export const isGoogleDriveUrl = (url: string): boolean => {
  return url.includes('drive.google.com') || url.includes('docs.google.com')
}

/**
 * Google Drive画像のサムネイルURLを生成
 * @param url - Google Driveの共有URL
 * @returns サムネイル用URL（400px）
 */
export const getGoogleDriveThumbnailUrl = (url: string): string => {
  return convertGoogleDriveImageUrl(url, 'm')
}

/**
 * 複数のGoogle Drive URLを一括変換
 * @param urls - URL配列
 * @param type - 変換タイプ ('image' | 'video' | 'thumbnail')
 * @returns 変換済みURL配列
 */
export const convertGoogleDriveUrls = (
  urls: string[],
  type: 'image' | 'video' | 'thumbnail' = 'image'
): string[] => {
  return urls.map(url => {
    if (!isGoogleDriveUrl(url)) {
      return url
    }

    switch (type) {
      case 'video':
        return convertGoogleDriveVideoUrl(url)
      case 'thumbnail':
        return getGoogleDriveThumbnailUrl(url)
      case 'image':
      default:
        return convertGoogleDriveImageUrl(url)
    }
  })
}

/**
 * URLの形式を検証
 * @param url - 検証するURL
 * @returns 有効なURLの場合true
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Google Drive共有設定の確認用メッセージ
 */
export const GOOGLE_DRIVE_SHARING_INSTRUCTIONS = {
  ja: {
    title: 'Google Driveからの画像・動画の使用方法',
    steps: [
      'Google Driveでファイルを右クリック → 「共有」',
      '「リンクを取得」→ 「制限付き」を「リンクを知っている全員」に変更',
      'リンクをコピーして下記に貼り付け',
      '自動的に表示用URLに変換されます'
    ],
    note: '注意: ファイルが「リンクを知っている全員」で共有されていないとアクセスできません。'
  },
  en: {
    title: 'How to use images/videos from Google Drive',
    steps: [
      'Right-click the file in Google Drive → "Share"',
      '"Get link" → Change "Restricted" to "Anyone with the link"',
      'Copy the link and paste it below',
      'It will be automatically converted to display URL'
    ],
    note: 'Note: Files must be shared as "Anyone with the link" to be accessible.'
  }
} as const