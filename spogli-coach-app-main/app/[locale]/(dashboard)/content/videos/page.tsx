'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useVideos } from '@/hooks/use-videos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Download,
  Edit,
  Trash2,
  Eye,
  Clock,
  HardDrive,
  AlertTriangle,
  Film,
} from 'lucide-react'
import { VideoWithDetails, CONTENT_CATEGORIES } from '@/types/content'

export default function VideosPage() {
  const params = useParams()
  const locale = params?.locale || 'ja'
  const { videos, loading, error, fetchVideos, downloadVideo, deleteVideo } = useVideos()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sportFilter, setSportFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  // ページロード時に動画データを取得
  useEffect(() => {
    fetchVideos()
  }, [])

  const handleSearch = () => {
    fetchVideos({
      search: searchTerm,
      category: categoryFilter,
      sport: sportFilter,
      level: levelFilter ? parseInt(levelFilter) : undefined,
    })
  }

  const handleDownload = async (video: VideoWithDetails) => {
    try {
      await downloadVideo(video.id)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('この動画を削除しますか？')) {
      try {
        await deleteVideo(id)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '不明'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '不明'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getSportBadgeColor = (sport: string) => {
    const colors = {
      soccer: 'bg-green-100 text-green-800',
      basketball: 'bg-orange-100 text-orange-800',
      baseball: 'bg-blue-100 text-blue-800',
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
          <p className="text-muted-foreground">動画データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>再試行</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">動画ライブラリ</h1>
          <p className="text-muted-foreground mt-2">
            指導動画の管理・視聴・ダウンロード
          </p>
        </div>
        <Link href={`/${locale}/content/videos/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            動画をアップロード
          </Button>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="タイトル、説明で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全カテゴリ</SelectItem>
                {Object.entries(CONTENT_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="スポーツで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全スポーツ</SelectItem>
                <SelectItem value="soccer">サッカー</SelectItem>
                <SelectItem value="basketball">バスケットボール</SelectItem>
                <SelectItem value="baseball">野球</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="レベルで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全レベル</SelectItem>
                <SelectItem value="1">Lv1: Rookie</SelectItem>
                <SelectItem value="2">Lv2: Challenger</SelectItem>
                <SelectItem value="3">Lv3: Adventurer</SelectItem>
                <SelectItem value="4">Lv4: Explorer</SelectItem>
                <SelectItem value="5">Lv5: Champion</SelectItem>
                <SelectItem value="6">Lv6: Master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch}>検索</Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {videos.length}件の動画
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 動画一覧 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="relative">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // サムネイル画像が読み込めない場合はプレースホルダーを表示
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-full h-48 bg-muted flex items-center justify-center ${video.thumbnail_url ? 'hidden' : ''}`}>
                <Film className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <Link href={`/${locale}/content/videos/${video.id}/play`}>
                  <Button size="lg" className="bg-white/20 backdrop-blur-sm">
                    <Play className="h-6 w-6 mr-2" />
                    再生
                  </Button>
                </Link>
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg leading-tight">{video.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/content/videos/${video.id}/play`}>
                        <Play className="h-4 w-4 mr-2" />
                        再生
                      </Link>
                    </DropdownMenuItem>
                    {video.is_downloadable && (
                      <DropdownMenuItem onClick={() => handleDownload(video)}>
                        <Download className="h-4 w-4 mr-2" />
                        ダウンロード
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/content/videos/${video.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        編集
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {video.description && (
                <CardDescription className="line-clamp-2">
                  {video.description}
                </CardDescription>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge className={getSportBadgeColor(video.sport)}>
                  {video.sport}
                </Badge>
                <Badge className={getLevelBadgeColor(video.level)}>
                  Lv{video.level}
                </Badge>
                <Badge variant="outline">
                  {CONTENT_CATEGORIES[video.category as keyof typeof CONTENT_CATEGORIES]}
                </Badge>
                {!video.is_downloadable && (
                  <Badge variant="secondary">視聴のみ</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{video.view_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{video.download_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(video.file_size)}</span>
                </div>
              </div>

              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {video.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {video.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{video.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-3">
                作成者: {video.created_by_name || 'Unknown'} • {new Date(video.created_at).toLocaleDateString('ja-JP')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            動画が見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しい動画をアップロードしてください
          </p>
          <Link href={`/${locale}/content/videos/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              動画をアップロード
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}