import { convertGoogleDriveImageUrl, isGoogleDriveUrl } from '@/lib/google-drive-utils'

interface GoogleDriveImageProps {
  src?: string | null
  alt: string
  className?: string
  size?: 's' | 'm' | 'l' | 'xl' | number
  fallback?: React.ReactNode
  onError?: () => void
}

/**
 * Google Drive対応の画像コンポーネント
 * Google Drive URLを自動的に表示用URLに変換します
 */
export function GoogleDriveImage({
  src,
  alt,
  className = '',
  size,
  fallback,
  onError
}: GoogleDriveImageProps) {
  if (!src) {
    return fallback ? <>{fallback}</> : null
  }

  // Google Drive URLの場合は変換
  const imageSrc = isGoogleDriveUrl(src)
    ? convertGoogleDriveImageUrl(src, size)
    : src

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        onError?.()
      }}
    />
  )
}

/**
 * Avatar用のGoogle Drive画像コンポーネント
 */
export function GoogleDriveAvatar({
  src,
  alt,
  size = 40,
  fallback
}: {
  src?: string | null
  alt: string
  size?: number
  fallback?: React.ReactNode
}) {
  return (
    <div
      className="relative overflow-hidden rounded-full bg-muted"
      style={{ width: size, height: size }}
    >
      <GoogleDriveImage
        src={src}
        alt={alt}
        size={size}
        className="h-full w-full object-cover"
        fallback={fallback}
      />
    </div>
  )
}