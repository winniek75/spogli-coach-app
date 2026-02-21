'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
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
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('schedule.sports')
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
          <p className="text-muted-foreground">{t('loading')}</p>
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
          <Button onClick={() => window.location.reload()}>{t('retry')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('newSport')}
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
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {SPORT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              {t('search')}
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
                      {t('code')}: {sport.code}
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
                      <Link href={`/${locale}/sports/${sport.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('viewDetails')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/sports/${sport.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('edit')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/sports/${sport.id}/goals`}>
                        <Target className="h-4 w-4 mr-2" />
                        {t('goalManagement')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(sport.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('delete')}
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
                  {sport.is_active ? t('active') : t('inactive')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {sport.objectives && sport.objectives.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span>{sport.objectives.length} {t('objectives')}</span>
                  </div>
                )}
                {sport.skills && sport.skills.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-muted-foreground" />
                    <span>{sport.skills.length} {t('skills')}</span>
                  </div>
                )}
                {sport.levels && sport.levels.length > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span>{sport.levels.length} {t('levels')}</span>
                  </div>
                )}
                {sport.equipment && sport.equipment.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span>{sport.equipment.length} {t('equipment')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/${locale}/sports/${sport.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    {t('details')}
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/${locale}/sports/${sport.id}/goals`}>
                    <Target className="h-3 w-3 mr-1" />
                    {t('goals')}
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
            {t('noSportsFound')}
          </p>
          <p className="text-muted-foreground mb-4">
            {t('changeConditionsOrAdd')}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addNewSport')}
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
  const t = useTranslations('schedule.sports')
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
        <DialogTitle>{t('addNewSportTitle')}</DialogTitle>
        <DialogDescription>
          {t('enterSportInfo')}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">{t('sportCode')}</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="soccer"
              required
            />
          </div>

          <div>
            <Label htmlFor="name">{t('sportName')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('sportNamePlaceholder')}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">{t('category')}</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {SPORT_CATEGORIES.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">{t('description')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('sportDescriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="icon">{t('icon')}</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="⚽"
            />
          </div>

          <div>
            <Label htmlFor="color">{t('color')}</Label>
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
            {t('cancel')}
          </Button>
          <Button type="submit">{t('create')}</Button>
        </DialogFooter>
      </form>
    </>
  )
}
