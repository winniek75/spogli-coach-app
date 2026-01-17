'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLessonMenus } from '@/hooks/use-lesson-menus'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Share2,
  Trash2,
  Clock,
  Users,
  Target,
  Play,
  BookOpen,
  Star,
  AlertTriangle,
  Copy,
} from 'lucide-react'
import { LessonMenuWithDetails, ACTIVITY_TYPES } from '@/types/lesson-menu'

export default function LessonMenusPage() {
  const { lessonMenus, loading, error, fetchLessonMenus, deleteLessonMenu, shareLessonMenu } = useLessonMenus()
  const [searchTerm, setSearchTerm] = useState('')
  const [sportFilter, setSportFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')

  const handleSearch = () => {
    const filters: any = {
      search: searchTerm,
      sport: sportFilter,
      level: levelFilter ? parseInt(levelFilter) : undefined,
    }

    if (activeTab === 'public') {
      filters.is_public = true
    } else if (activeTab === 'templates') {
      filters.is_template = true
    }

    fetchLessonMenus(filters)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const filters: any = {
      search: searchTerm,
      sport: sportFilter,
      level: levelFilter ? parseInt(levelFilter) : undefined,
    }

    if (value === 'public') {
      filters.is_public = true
    } else if (value === 'templates') {
      filters.is_template = true
    }

    fetchLessonMenus(filters)
  }

  const handleDelete = async (id: string) => {
    if (confirm('このレッスンメニューを削除しますか？')) {
      try {
        await deleteLessonMenu(id)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  const handleCopyMenu = (menu: LessonMenuWithDetails) => {
    // コピー処理（新規作成画面に遷移）
    const menuData = JSON.stringify({
      title: `${menu.title} (コピー)`,
      description: menu.description,
      sport: menu.sport,
      level: menu.level,
      duration_minutes: menu.duration_minutes,
      max_participants: menu.max_participants,
      equipment_needed: menu.equipment_needed,
      objectives: menu.objectives,
      activities: menu.activities,
      notes: menu.notes,
    })

    localStorage.setItem('copyMenuData', menuData)
    window.location.href = '/lessons/menus/new?copy=true'
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? mins + '分' : ''}`
    }
    return `${mins}分`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">レッスンメニューデータを読み込んでいます...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">レッスンメニュー</h1>
          <p className="text-muted-foreground mt-2">
            練習メニューの作成・管理・共有
          </p>
        </div>
        <Link href="/lessons/menus/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規メニュー作成
          </Button>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
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

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="スポーツで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全スポーツ</SelectItem>
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
                <SelectItem value="">全レベル</SelectItem>
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
        </CardContent>
      </Card>

      {/* タブ */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="public">公開メニュー</TabsTrigger>
          <TabsTrigger value="templates">テンプレート</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessonMenus.map((menu) => (
              <Card key={menu.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {menu.title}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/lessons/menus/${menu.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                詳細表示
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/lessons/menus/${menu.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                編集
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyMenu(menu)}>
                              <Copy className="h-4 w-4 mr-2" />
                              コピー
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/lessons/menus/${menu.id}/share`}>
                                <Share2 className="h-4 w-4 mr-2" />
                                共有
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(menu.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {menu.description && (
                        <CardDescription className="line-clamp-2 mb-3">
                          {menu.description}
                        </CardDescription>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Badge className={getSportBadgeColor(menu.sport)}>
                          {menu.sport}
                        </Badge>
                        <Badge className={getLevelBadgeColor(menu.level)}>
                          Lv{menu.level}
                        </Badge>
                        {menu.is_public && (
                          <Badge variant="outline">公開</Badge>
                        )}
                        {menu.is_template && (
                          <Badge variant="secondary">テンプレート</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDuration(menu.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{menu.max_participants}名</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-3 w-3 text-muted-foreground" />
                      <span>{menu.activities?.length || 0}項目</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      <span>{menu.usage_count || 0}回利用</span>
                    </div>
                  </div>

                  {menu.objectives && menu.objectives.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">目標</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {menu.objectives.slice(0, 2).join(', ')}
                        {menu.objectives.length > 2 && '...'}
                      </div>
                    </div>
                  )}

                  {menu.activities && menu.activities.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">主なアクティビティ</div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(menu.activities.map(a => a.activity_type))).slice(0, 3).map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES] || type}
                          </Badge>
                        ))}
                        {Array.from(new Set(menu.activities.map(a => a.activity_type))).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{Array.from(new Set(menu.activities.map(a => a.activity_type))).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    作成者: {menu.created_by_name || 'Unknown'} • {new Date(menu.created_at).toLocaleDateString('ja-JP')}
                    {menu.last_used_date && (
                      <span> • 最終利用: {new Date(menu.last_used_date).toLocaleDateString('ja-JP')}</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/lessons/menus/${menu.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        詳細
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/lessons/menus/${menu.id}/share`}>
                        <Share2 className="h-3 w-3 mr-1" />
                        共有
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {lessonMenus.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            レッスンメニューが見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しいレッスンメニューを作成してください
          </p>
          <Link href="/lessons/menus/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規メニュー作成
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}