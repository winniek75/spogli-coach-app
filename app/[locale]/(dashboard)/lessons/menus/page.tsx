'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Clock,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle2,
  Circle,
  PlusCircle,
} from 'lucide-react'
import { useLessonMenus } from '@/hooks/use-lesson-menus'
import { SportMenuGroup, WeekType } from '@/types/lesson-menu'

// 週タイプの表示名を定義
const WEEK_LABELS: Record<WeekType, string> = {
  week1: '第1週',
  week2: '第2週',
  week3: '第3週',
  week4: '第4週',
  backup: '振替用'
}

// 週タイプの色を定義
const WEEK_COLORS: Record<WeekType, string> = {
  week1: 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400',
  week2: 'bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-400',
  week3: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400',
  week4: 'bg-purple-100 text-purple-900 dark:bg-purple-900/20 dark:text-purple-400',
  backup: 'bg-gray-100 text-gray-900 dark:bg-gray-900/20 dark:text-gray-400'
}

export default function LessonMenusPage() {
  const t = useTranslations('schedule.lessonMenus')
  const { groupedMenus, loading, error, fetchLessonMenus } = useLessonMenus()

  // フィルター状態
  const [selectedSport, setSelectedSport] = useState<string>('all')
  const [selectedClassType, setSelectedClassType] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // 現在の年月
  )
  const [searchTerm, setSearchTerm] = useState('')

  // データの再取得
  useEffect(() => {
    const filters: any = {
      month: selectedMonth
    }

    if (selectedSport !== 'all') {
      filters.sport = selectedSport
    }

    if (selectedClassType !== 'all') {
      filters.class_type = selectedClassType
    }

    if (searchTerm) {
      filters.search = searchTerm
    }

    fetchLessonMenus(filters)
  }, [selectedMonth, selectedSport, selectedClassType, searchTerm])

  // フィルター処理されたグループ
  const filteredGroups = groupedMenus.filter(group => {
    if (selectedSport !== 'all' && group.sport !== selectedSport) {
      return false
    }
    if (selectedClassType !== 'all' && group.class_type !== selectedClassType) {
      return false
    }
    return true
  })

  // 月の表示形式をフォーマット
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${year}年${parseInt(month)}月`
  }

  // メニュー項目のクリックハンドラー
  const handleMenuAction = (action: string, menuId?: string, weekType?: WeekType) => {
    switch (action) {
      case 'edit':
        // 編集ページへ遷移
        if (menuId) {
          window.location.href = `/lessons/menus/${menuId}/edit`
        }
        break
      case 'copy':
        // コピー処理
        console.log('Copy menu:', menuId)
        break
      case 'delete':
        // 削除処理
        if (confirm(t('confirmDelete'))) {
          console.log('Delete menu:', menuId)
        }
        break
      case 'create':
        // 新規作成ページへ遷移（週タイプを指定）
        window.location.href = `/lessons/menus/create?week=${weekType}`
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => fetchLessonMenus()} className="mt-4">
            {t('retry')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/lessons/menus/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('createNewMenu')}
          </Button>
        </Link>
      </div>

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48"
          />
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('filterBySport')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allSports')}</SelectItem>
              <SelectItem value="volleyball">{t('volleyball')}</SelectItem>
              <SelectItem value="basketball">{t('basketball')}</SelectItem>
              <SelectItem value="soccer">{t('soccer')}</SelectItem>
              <SelectItem value="tennis">{t('tennis')}</SelectItem>
              <SelectItem value="rugby">{t('rugby')}</SelectItem>
              <SelectItem value="baseball">{t('baseball')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedClassType} onValueChange={setSelectedClassType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('filterByClass')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allClasses')}</SelectItem>
              <SelectItem value="preschool">{t('preschool')}</SelectItem>
              <SelectItem value="elementary">{t('elementary')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 月の表示 */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{formatMonth(selectedMonth)}</h2>
      </div>

      {/* メニューグループ表示 */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              {t('noMenusFound')}
            </p>
            <p className="text-muted-foreground text-center mb-6">
              {t('changeConditionsOrCreate')}
            </p>
            <Link href="/lessons/menus/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('createNewMenu')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <Card key={`${group.sport}-${group.class_type}-${group.month}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {group.sportName}
                    </CardTitle>
                    <CardDescription>
                      {group.class_type === 'preschool' ? t('preschool') : t('elementary')} • {formatMonth(group.month)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {Object.keys(group.menus).length} / 5 {t('weeks')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {(['week1', 'week2', 'week3', 'week4', 'backup'] as WeekType[]).map((weekType) => {
                    const menu = group.menus[weekType]

                    if (!menu) {
                      // メニューが存在しない週は作成ボタンを表示
                      return (
                        <div
                          key={weekType}
                          className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer min-h-[200px]"
                          onClick={() => handleMenuAction('create', undefined, weekType)}
                        >
                          <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="font-medium text-sm">{WEEK_LABELS[weekType]}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('clickToCreate')}
                          </p>
                        </div>
                      )
                    }

                    // メニューが存在する週はメニューカードを表示
                    return (
                      <div
                        key={weekType}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={WEEK_COLORS[weekType]}>
                            {WEEK_LABELS[weekType]}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleMenuAction('edit', menu.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMenuAction('copy', menu.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                {t('copy')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleMenuAction('delete', menu.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                          {menu.title}
                        </h3>

                        {menu.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {menu.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {menu.duration_minutes}{t('minutes')}
                          </div>
                        </div>

                        {/* アクティビティ数の表示 */}
                        <div className="mt-3 flex flex-col gap-1">
                          <div className="flex items-center text-xs">
                            {menu.activities?.length > 0 ? (
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 mr-1 text-muted-foreground" />
                            )}
                            {menu.activities?.length || 0} {t('activities')}
                          </div>
                        </div>

                        <Link href={`/lessons/menus/${menu.id}`}>
                          <Button variant="ghost" size="sm" className="w-full mt-3">
                            <Eye className="mr-2 h-3 w-3" />
                            {t('viewDetails')}
                          </Button>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}