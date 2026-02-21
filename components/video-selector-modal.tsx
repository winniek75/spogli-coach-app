'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Video, Clock, Check } from 'lucide-react'

// デモ動画データ
const demoVideos = [
  {
    id: 'video-1',
    title: 'バレーボール アンダーハンドパス基礎',
    description: '初心者向けアンダーハンドパスの基本動作を解説',
    sport: 'volleyball',
    sportName: 'バレーボール',
    category: 'technique',
    level: 1,
    duration: 180,
    thumbnailUrl: '/api/placeholder/320/180',
  },
  {
    id: 'video-2',
    title: 'バレーボール サーブ練習',
    description: 'サーブの基本フォームと練習方法',
    sport: 'volleyball',
    sportName: 'バレーボール',
    category: 'technique',
    level: 2,
    duration: 240,
    thumbnailUrl: '/api/placeholder/320/180',
  },
  {
    id: 'video-3',
    title: 'バスケットボール ドリブル基礎',
    description: '基本的なドリブルテクニック',
    sport: 'basketball',
    sportName: 'バスケットボール',
    category: 'technique',
    level: 1,
    duration: 300,
    thumbnailUrl: '/api/placeholder/320/180',
  },
  {
    id: 'video-4',
    title: 'バスケットボール レイアップシュート',
    description: 'レイアップシュートの基本動作',
    sport: 'basketball',
    sportName: 'バスケットボール',
    category: 'technique',
    level: 2,
    duration: 210,
    thumbnailUrl: '/api/placeholder/320/180',
  },
  {
    id: 'video-5',
    title: 'サッカー インサイドキック',
    description: '正確なインサイドキックの練習方法',
    sport: 'soccer',
    sportName: 'サッカー',
    category: 'technique',
    level: 1,
    duration: 180,
    thumbnailUrl: '/api/placeholder/320/180',
  },
  {
    id: 'video-6',
    title: 'サッカー ドリブル練習',
    description: 'ボールコントロールとドリブルの基礎',
    sport: 'soccer',
    sportName: 'サッカー',
    category: 'technique',
    level: 2,
    duration: 360,
    thumbnailUrl: '/api/placeholder/320/180',
  },
  {
    id: 'video-7',
    title: '体力づくり - ウォームアップ',
    description: '効果的なウォームアップ方法',
    sport: 'all',
    sportName: '共通',
    category: 'training',
    level: 1,
    duration: 300,
    thumbnailUrl: '/api/placeholder/320/180',
  },
  {
    id: 'video-8',
    title: 'ストレッチング',
    description: 'クールダウンのためのストレッチ',
    sport: 'all',
    sportName: '共通',
    category: 'training',
    level: 1,
    duration: 420,
    thumbnailUrl: '/api/placeholder/320/180',
  },
]

interface VideoSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (video: any) => void
  selectedVideoId?: string
  sportFilter?: string
}

export function VideoSelectorModal({
  open,
  onOpenChange,
  onSelect,
  selectedVideoId,
  sportFilter,
}: VideoSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [selectedVideo, setSelectedVideo] = useState<any>(null)

  useEffect(() => {
    if (selectedVideoId) {
      const video = demoVideos.find(v => v.id === selectedVideoId)
      if (video) setSelectedVideo(video)
    }
  }, [selectedVideoId])

  const filteredVideos = demoVideos.filter(video => {
    const matchesSearch = searchTerm === '' ||
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSport = !sportFilter || sportFilter === 'all' ||
      video.sport === sportFilter || video.sport === 'all'

    const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter

    const matchesLevel = levelFilter === 'all' || video.level === parseInt(levelFilter)

    return matchesSearch && matchesSport && matchesCategory && matchesLevel
  })

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleConfirm = () => {
    if (selectedVideo) {
      onSelect(selectedVideo)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>動画を選択</DialogTitle>
          <DialogDescription>
            このアクティビティで使用する動画教材を選択してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* フィルター */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="動画を検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリー" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全カテゴリー</SelectItem>
                <SelectItem value="technique">テクニック</SelectItem>
                <SelectItem value="training">トレーニング</SelectItem>
                <SelectItem value="rule">ルール説明</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="レベル" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全レベル</SelectItem>
                <SelectItem value="1">初級</SelectItem>
                <SelectItem value="2">中級</SelectItem>
                <SelectItem value="3">上級</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 動画リスト */}
          <div className="h-[400px] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
              {filteredVideos.map(video => (
                <div
                  key={video.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedVideo?.id === video.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="flex gap-3">
                    <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Video className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-gray-400" />
                      {selectedVideo?.id === video.id && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <Check className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{video.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {video.sportName}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">該当する動画が見つかりません</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedVideo}>
            選択
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}