'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSports } from '@/hooks/use-sports'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Trophy,
  Target,
  Activity,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { Sport, SPORT_CATEGORIES, CreateSportRequest } from '@/types/sport'

export default function SportsPage() {
  const { sports, loading, error, fetchSports, createSport, deleteSport } = useSports()
  const [searchTerm, setSearchTerm] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleSearch = () => {
    const filters: {
      search?: string
      category?: string
      is_active?: boolean
    } = {}

    if (searchTerm) {
      filters.search = searchTerm
    }

    if (categoryFilter) {
      filters.category = categoryFilter
    }

    if (activeFilter) {
      filters.is_active = activeFilter === 'active'
    }

    fetchSports(filters)
  }

  const handleDelete = async (id: string) => {
    if (confirm('このスポーツを削除しますか？関連するデータも影響を受ける可能性があります。')) {
      try {
        await deleteSport(id)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  const getCategoryColor = (categoryId?: string) => {
    const colors: { [key: string]: string } = {
      ball: 'bg-blue-100 text-blue-800',
      track: 'bg-green-100 text-green-800',
      water: 'bg-cyan-100 text-cyan-800',
      martial: 'bg-red-100 text-red-800',
      dance: 'bg-purple-100 text-purple-800',
      winter: 'bg-gray-100 text-gray-800',
      other: 'bg-yellow-100 text-yellow-800',
    }
    return colors[categoryId || 'other'] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">スポーツデータを読み込んでいます...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">スポーツ管理</h1>
          <p className="text-muted-foreground mt-2">
            スポーツ種目の管理・目標設定
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規スポーツ追加
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <CreateSportForm
              onSubmit={async (data) => {
                await createSport(data)
                setShowCreateDialog(false)
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="スポーツ名で検索..."
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
                {SPORT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">有効</SelectItem>
                <SelectItem value="inactive">無効</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* スポーツ一覧 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sports.map((sport) => (
          <Card key={sport.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div
                    className="p-3 rounded-lg text-2xl"
                    style={{ backgroundColor: sport.color ? `${sport.color}20` : '#f0f0f0' }}
                  >
                    {sport.icon || '🏃'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{sport.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      コード: {sport.code}
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
                      <Link href={`/sports/${sport.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        詳細表示
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/sports/${sport.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        編集
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/sports/${sport.id}/goals`}>
                        <Target className="h-4 w-4 mr-2" />
                        目標管理
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(sport.id)}
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
              {sport.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {sport.description}
                </p>
              )}

              <div className="flex items-center gap-2">
                {sport.category && (
                  <Badge className={getCategoryColor(sport.category.id)}>
                    {sport.category.name}
                  </Badge>
                )}
                <Badge variant={sport.is_active ? 'default' : 'secondary'}>
                  {sport.is_active ? '有効' : '無効'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {sport.objectives && sport.objectives.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span>{sport.objectives.length}個の目標</span>
                  </div>
                )}
                {sport.skills && sport.skills.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-muted-foreground" />
                    <span>{sport.skills.length}個のスキル</span>
                  </div>
                )}
                {sport.levels && sport.levels.length > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span>{sport.levels.length}レベル</span>
                  </div>
                )}
                {sport.equipment && sport.equipment.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span>{sport.equipment.length}個の器具</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/sports/${sport.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    詳細
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/sports/${sport.id}/goals`}>
                    <Target className="h-3 w-3 mr-1" />
                    目標
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sports.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            スポーツが見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しいスポーツを追加してください
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新規スポーツ追加
          </Button>
        </div>
      )}
    </div>
  )
}

function CreateSportForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: CreateSportRequest) => Promise<void>
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<CreateSportRequest>({
    code: '',
    name: '',
    description: '',
    category_id: '',
    icon: '',
    color: '#0066cc',
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>新しいスポーツを追加</DialogTitle>
        <DialogDescription>
          スポーツの基本情報を入力してください
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">スポーツコード</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="soccer"
              required
            />
          </div>

          <div>
            <Label htmlFor="name">スポーツ名</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="サッカー"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">カテゴリ</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {SPORT_CATEGORIES.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="スポーツの説明を入力"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="icon">アイコン</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="⚽"
            />
          </div>

          <div>
            <Label htmlFor="color">カラー</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">作成</Button>
        </DialogFooter>
      </form>
    </>
  )
}
