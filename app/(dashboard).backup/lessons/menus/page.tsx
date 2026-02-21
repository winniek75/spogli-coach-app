'use client'

import { useState } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Clock,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Share2,
  FileText,
  Printer,
} from 'lucide-react'

// デモデータ - レッスンメニュー
const demoMenus = [
  {
    id: 'menu-1',
    title: 'バレーボール基礎練習',
    sport: 'volleyball',
    sportName: 'バレーボール',
    classType: 'preschool',
    duration: 50,
    description: '両手キャッチとアンダーハンドパスの基本を学ぶ',
    warmup: [
      { name: 'ジョギング', duration: 3, description: '体育館を2周' },
      { name: 'ストレッチ', duration: 5, description: '全身のストレッチ' },
    ],
    activities: [
      { name: 'ボールキャッチ練習', duration: 10, description: '両手でボールをキャッチする練習', equipment: ['バレーボール'] },
      { name: 'アンダーハンドパス', duration: 15, description: 'ペアでアンダーハンドパスの練習', equipment: ['バレーボール'] },
      { name: 'ミニゲーム', duration: 12, description: '4対4のミニゲーム', equipment: ['バレーボール', 'ネット'] },
    ],
    cooldown: [
      { name: 'クールダウン', duration: 5, description: 'ストレッチと振り返り' },
    ],
    englishPhrases: ['Catch!', 'Ready!', 'Good job!', 'Nice try!'],
    createdAt: '2025-01-15',
    updatedAt: '2025-01-18',
    isTemplate: true,
  },
  {
    id: 'menu-2',
    title: 'バスケットボール ドリブル強化',
    sport: 'basketball',
    sportName: 'バスケットボール',
    classType: 'elementary',
    duration: 50,
    description: 'ドリブルスキルの向上を目指す',
    warmup: [
      { name: 'ランニング', duration: 3, description: 'コートを走る' },
      { name: 'ダイナミックストレッチ', duration: 5, description: '動的ストレッチ' },
    ],
    activities: [
      { name: 'ドリブル基礎', duration: 10, description: '右手・左手でのドリブル練習', equipment: ['バスケットボール'] },
      { name: 'ドリブルリレー', duration: 10, description: 'チーム対抗ドリブルリレー', equipment: ['バスケットボール', 'コーン'] },
      { name: 'シュート練習', duration: 10, description: 'レイアップシュートの練習', equipment: ['バスケットボール', 'ゴール'] },
      { name: 'ミニゲーム', duration: 7, description: '3対3のミニゲーム', equipment: ['バスケットボール'] },
    ],
    cooldown: [
      { name: 'クールダウン', duration: 5, description: 'ストレッチと振り返り' },
    ],
    englishPhrases: ['Dribble!', 'Shoot!', 'Pass!', 'Great shot!'],
    createdAt: '2025-01-10',
    updatedAt: '2025-01-17',
    isTemplate: true,
  },
  {
    id: 'menu-3',
    title: 'サッカー キック練習',
    sport: 'soccer',
    sportName: 'サッカー',
    classType: 'preschool',
    duration: 50,
    description: 'インサイドキックの基本を学ぶ',
    warmup: [
      { name: '鬼ごっこ', duration: 5, description: 'ウォームアップを兼ねた鬼ごっこ' },
      { name: 'ストレッチ', duration: 3, description: '足のストレッチ' },
    ],
    activities: [
      { name: 'ボールタッチ', duration: 8, description: '足でボールを触る練習', equipment: ['サッカーボール'] },
      { name: 'インサイドキック', duration: 12, description: 'インサイドキックの練習', equipment: ['サッカーボール', 'コーン'] },
      { name: 'パス練習', duration: 10, description: 'ペアでパス練習', equipment: ['サッカーボール'] },
      { name: 'ミニゲーム', duration: 7, description: 'ミニゲーム', equipment: ['サッカーボール', 'ゴール'] },
    ],
    cooldown: [
      { name: 'クールダウン', duration: 5, description: 'ストレッチと振り返り' },
    ],
    englishPhrases: ['Kick!', 'Pass!', 'Goal!', 'Well done!'],
    createdAt: '2025-01-12',
    updatedAt: '2025-01-16',
    isTemplate: false,
  },
]

interface LessonMenu {
  id: string
  title: string
  sport: string
  sportName: string
  classType: string
  duration: number
  description?: string
  warmup: { name: string; duration: number; description?: string }[]
  activities: { name: string; duration: number; description?: string; equipment?: string[] }[]
  cooldown: { name: string; duration: number; description?: string }[]
  englishPhrases?: string[]
  createdAt: string
  updatedAt: string
  isTemplate: boolean
}

export default function LessonMenusPage() {
  const [menus, setMenus] = useState<LessonMenu[]>(demoMenus)
  const [searchTerm, setSearchTerm] = useState('')
  const [sportFilter, setSportFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')

  // フィルタリング
  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          menu.sportName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSport = sportFilter === 'all' || menu.sport === sportFilter
    const matchesClass = classFilter === 'all' || menu.classType === classFilter
    
    return matchesSearch && matchesSport && matchesClass
  })

  const handleDelete = (id: string) => {
    if (confirm('このレッスンメニューを削除しますか？')) {
      setMenus(prev => prev.filter(m => m.id !== id))
    }
  }

  const handleDuplicate = (menu: LessonMenu) => {
    const duplicated: LessonMenu = {
      ...menu,
      id: `menu-${Date.now()}`,
      title: `${menu.title} (コピー)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isTemplate: false,
    }
    setMenus(prev => [...prev, duplicated])
  }

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      volleyball: '🏐',
      basketball: '🏀',
      soccer: '⚽',
      tennis: '🎾',
      rugby: '🏉',
      baseball: '⚾',
    }
    return icons[sport] || '🏃'
  }

  const getClassTypeBadge = (classType: string) => (
    <Badge variant="secondary" className="text-xs">
      {classType === 'preschool' ? '幼児' : '小学生'}
    </Badge>
  )

  const getTotalDuration = (menu: LessonMenu) => {
    const warmupTime = menu.warmup.reduce((sum, item) => sum + item.duration, 0)
    const activityTime = menu.activities.reduce((sum, item) => sum + item.duration, 0)
    const cooldownTime = menu.cooldown.reduce((sum, item) => sum + item.duration, 0)
    return warmupTime + activityTime + cooldownTime
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">レッスンメニュー</h1>
          <p className="text-muted-foreground mt-2">
            レッスンのメニューテンプレートを管理します
          </p>
        </div>

        <Button asChild>
          <Link href="/lessons/menus/new">
            <Plus className="h-4 w-4 mr-2" />
            新規メニュー作成
          </Link>
        </Button>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="メニュー名・スポーツで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger>
                <SelectValue placeholder="スポーツで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全スポーツ</SelectItem>
                <SelectItem value="volleyball">バレーボール</SelectItem>
                <SelectItem value="basketball">バスケットボール</SelectItem>
                <SelectItem value="soccer">サッカー</SelectItem>
                <SelectItem value="tennis">テニス</SelectItem>
                <SelectItem value="rugby">ラグビー</SelectItem>
                <SelectItem value="baseball">野球</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="クラスで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全クラス</SelectItem>
                <SelectItem value="preschool">幼児</SelectItem>
                <SelectItem value="elementary">小学生</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* メニュー一覧 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMenus.map((menu) => (
          <Card key={menu.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {getSportIcon(menu.sport)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{menu.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {menu.sportName}
                    </CardDescription>
                  </div>
                </div>

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
                    <DropdownMenuItem onClick={() => handleDuplicate(menu)}>
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
            </CardHeader>

            <CardContent className="space-y-4">
              {menu.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {menu.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {getClassTypeBadge(menu.classType)}
                {menu.isTemplate && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    テンプレート
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{getTotalDuration(menu)}分</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span>{menu.activities.length}アクティビティ</span>
                </div>
              </div>

              {/* タイムライン概要 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-16 text-muted-foreground">ウォームアップ</div>
                  <div className="flex-1 h-2 bg-yellow-100 rounded">
                    <div 
                      className="h-full bg-yellow-400 rounded" 
                      style={{ width: `${(menu.warmup.reduce((sum, item) => sum + item.duration, 0) / menu.duration) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-16 text-muted-foreground">メイン</div>
                  <div className="flex-1 h-2 bg-blue-100 rounded">
                    <div 
                      className="h-full bg-blue-400 rounded" 
                      style={{ width: `${(menu.activities.reduce((sum, item) => sum + item.duration, 0) / menu.duration) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-16 text-muted-foreground">クールダウン</div>
                  <div className="flex-1 h-2 bg-green-100 rounded">
                    <div 
                      className="h-full bg-green-400 rounded" 
                      style={{ width: `${(menu.cooldown.reduce((sum, item) => sum + item.duration, 0) / menu.duration) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 英語フレーズ */}
              {menu.englishPhrases && menu.englishPhrases.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {menu.englishPhrases.slice(0, 4).map((phrase, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {phrase}
                    </Badge>
                  ))}
                  {menu.englishPhrases.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{menu.englishPhrases.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/lessons/menus/${menu.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    詳細
                  </Link>
                </Button>
                <Button size="sm" className="flex-1" onClick={() => handleDuplicate(menu)}>
                  <Copy className="h-3 w-3 mr-1" />
                  コピー
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMenus.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            レッスンメニューが見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しいメニューを作成してください
          </p>
          <Button asChild>
            <Link href="/lessons/menus/new">
              <Plus className="h-4 w-4 mr-2" />
              新規メニュー作成
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
