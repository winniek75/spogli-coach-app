'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useVideo } from '@/hooks/use-videos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  AlertTriangle,
  Film,
  Clock,
  Eye,
  HardDrive
} from 'lucide-react'
import Link from 'next/link'
import { CONTENT_CATEGORIES } from '@/types/content'

export default function VideoPlayPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale || 'ja'
  const videoId = params?.id as string

  const { video, loading, error } = useVideo(videoId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)

  useEffect(() => {
    if (!videoId) {
      router.push(`/${locale}/content/videos`)
    }
  }, [videoId, router, locale])

  const handleVideoError = () => {
    setVideoError('動画の読み込みに失敗しました')
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '不明'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '不明'
    if (minutes < 60) return `${minutes}分`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}時間${remainingMinutes}分`
  }

  const getSportBadgeColor = (sport: string) => {
    const colors = {
      soccer: 'bg-green-100 text-green-800',
      basketball: 'bg-orange-100 text-orange-800',
      baseball: 'bg-blue-100 text-blue-800',
      volleyball: 'bg-purple-100 text-purple-800',
    }
    return colors[sport as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getLevelBadgeColor = (level: number) => {
    if (level <= 2) return 'bg-yellow-100 text-yellow-800'
    if (level <= 4) return 'bg-blue-100 text-blue-800'
    return 'bg-purple-100 text-purple-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">動画を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || '動画が見つかりません'}</p>
          <Link href={`/${locale}/content/videos`}>
            <Button>動画一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/content/videos`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{video.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getSportBadgeColor(video.sport)}>
              {video.sport}
            </Badge>
            <Badge className={getLevelBadgeColor(video.level)}>
              Lv{video.level}
            </Badge>
            <Badge variant="outline">
              {CONTENT_CATEGORIES[video.category as keyof typeof CONTENT_CATEGORIES]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 動画プレーヤー */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                {videoError ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg">{videoError}</p>
                      <p className="text-sm mt-2">動画ファイルのパスを確認してください</p>
                    </div>
                  </div>
                ) : (
                  <video
                    src={video.url}
                    poster={video.thumbnail_url}
                    controls
                    className="w-full h-full"
                    onError={handleVideoError}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
                    preload="metadata"
                  >
                    <source src={video.url} type="video/mp4" />
                    お使いのブラウザは動画タグをサポートしていません。
                  </video>
                )}
              </div>

              {/* カスタムコントロール（オプション） */}
              <div className="p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{video.view_count || 0} 回視聴</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {video.is_downloadable && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        ダウンロード
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 動画情報 */}
        <div className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>動画情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {video.description && (
                <div>
                  <h4 className="font-medium mb-2">説明</h4>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(video.duration_minutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span>{formatFileSize(video.file_size)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{video.view_count || 0} 回視聴</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>{video.download_count || 0} DL</span>
                </div>
              </div>

              {video.tags && video.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">タグ</h4>
                  <div className="flex flex-wrap gap-1">
                    {video.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>作成者: {video.created_by_name || '不明'}</p>
                <p>作成日: {new Date(video.created_at).toLocaleDateString('ja-JP')}</p>
                {video.updated_at !== video.created_at && (
                  <p>更新日: {new Date(video.updated_at).toLocaleDateString('ja-JP')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* アクション */}
          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {video.is_downloadable && (
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  動画をダウンロード
                </Button>
              )}
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/${locale}/content/videos/${video.id}/edit`}>
                  編集
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/${locale}/content/videos`}>
                  一覧に戻る
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}