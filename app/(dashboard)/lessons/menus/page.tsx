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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  Printer,
  Calendar,
  Video,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { LessonMenuWithDetails } from '@/types/lesson-menu'

export default function LessonMenusPage() {
  const { lessonMenus, loading, error, fetchLessonMenus, deleteLessonMenu, shareLessonMenu } = useLessonMenus()
  const [searchTerm, setSearchTerm] = useState('')
  const [sportFilter, setSportFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  const toggleMenuExpansion = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }

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

  const filteredMenus = lessonMenus.filter(menu => {
    const matchesType = !typeFilter ||
      (typeFilter === 'monthly' && menu.monthly_type === 'monthly') ||
      (typeFilter === 'single' && menu.monthly_type === 'single')

    return matchesType
  })

  const getSportBadgeColor = (sport: string) => {
    const colors = {
      soccer: 'bg-green-100 text-green-800',
      basketball: 'bg-orange-100 text-orange-800',
      volleyball: 'bg-purple-100 text-purple-800',
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

  const getSportName = (sport: string) => {
    const names = {
      soccer: 'サッカー',
      basketball: 'バスケットボール',
      volleyball: 'バレーボール',
      baseball: '野球'
    }
    return names[sport as keyof typeof names] || sport
  }

  const renderWeeklyProgram = (menu: LessonMenuWithDetails) => {
    if (!menu.weeks || menu.weeks.length === 0) return null

    return (
      <div className="mt-4 space-y-4">
        {menu.weeks.map((week) => (
          <Card key={week.week} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {week.title}
                  </CardTitle>
                  <CardDescription>{week.description}</CardDescription>
                </div>
                {week.video_content && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Video className="h-4 w-4" />
                    <span>{week.video_content.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatDuration(week.video_content.duration_minutes)}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {week.activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{activity.name}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.video_reference && (
                        <Video className="h-4 w-4 text-blue-500" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(activity.duration_minutes)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderSingleLessonActivities = (menu: LessonMenuWithDetails) => {
    if (!menu.activities || menu.activities.length === 0) return null

    return (
      <div className="mt-4">
        <div className="space-y-3">
          {menu.activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium">{activity.name}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activity.video_reference && (
                  <Video className="h-4 w-4 text-blue-500" />
                )}
                <Badge variant="outline" className="text-xs">
                  {formatDuration(activity.duration_minutes)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
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
            月次プログラムと単発レッスンの管理・共有
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="メニュー種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全メニュー</SelectItem>
                <SelectItem value="monthly">月次プログラム</SelectItem>
                <SelectItem value="single">単発レッスン</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="スポーツで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全スポーツ</SelectItem>
                <SelectItem value="soccer">サッカー</SelectItem>
                <SelectItem value="basketball">バスケットボール</SelectItem>
                <SelectItem value="volleyball">バレーボール</SelectItem>
                <SelectItem value="baseball">野球</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="レベルで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全レベル</SelectItem>
                <SelectItem value="1">初級 (1)</SelectItem>
                <SelectItem value="2">初級 (2)</SelectItem>
                <SelectItem value="3">中級 (3)</SelectItem>
                <SelectItem value="4">中級 (4)</SelectItem>
                <SelectItem value="5">上級 (5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* レッスンメニュー一覧 */}
      <div className="space-y-4">
        {filteredMenus.map((menu) => (
          <Collapsible key={menu.id}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger
                className="w-full text-left"
                onClick={() => toggleMenuExpansion(menu.id)}
              >
                <CardHeader className="hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {expandedMenus.has(menu.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <CardTitle className="text-xl">{menu.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {menu.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* バッジ群 */}
                      <div className="flex items-center gap-2">
                        {menu.monthly_type === 'monthly' && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            月次プログラム
                          </Badge>
                        )}
                        <Badge className={getSportBadgeColor(menu.sport)}>
                          {getSportName(menu.sport)}
                        </Badge>
                        <Badge className={getLevelBadgeColor(menu.level)}>
                          Lv.{menu.level}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(menu.duration_minutes)}
                        </Badge>
                      </div>

                      {/* アクションメニュー */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            コピー
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            共有
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            印刷
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* メタ情報 */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>目標: {menu.objectives?.slice(0, 2).join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>利用回数: {menu.usage_count || 0}回</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>作成者: {menu.created_by_name}</span>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {menu.monthly_type === 'monthly' ? (
                    <div>
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          📅 {menu.weeks?.length || 0}週間の総合プログラム
                        </h3>
                        <p className="text-sm text-blue-700">
                          各週で動画学習と実技練習を組み合わせた体系的なカリキュラムです
                        </p>
                      </div>
                      {renderWeeklyProgram(menu)}
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-2">
                          🎯 単発レッスンメニュー
                        </h3>
                        <p className="text-sm text-green-700">
                          1回完結型のレッスン構成です
                        </p>
                      </div>
                      {renderSingleLessonActivities(menu)}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {filteredMenus.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            レッスンメニューが見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しいメニューを作成してください
          </p>
          <Link href="/lessons/menus/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              メニューを作成
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}