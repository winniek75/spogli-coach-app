'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useMissions } from '@/hooks/use-missions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
  Eye,
  Edit,
  AlertTriangle,
  Target,
  Calendar,
  Users,
  Trophy,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react'
import { MissionSheetWithDetails } from '@/types/mission'

export default function MissionsPage() {
  const { missionSheets, loading, error, fetchMissions } = useMissions()
  const tMissions = useTranslations('missions')
  const tCommon = useTranslations('common')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sportFilter, setSportFilter] = useState<string>('all')
  const [schoolFilter, setSchoolFilter] = useState<string>('all')

  const filteredMissions = missionSheets.filter((mission) => {
    const matchesSearch =
      mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.coach?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter
    const matchesSport = sportFilter === 'all' || mission.sport === sportFilter
    const matchesSchool = schoolFilter === 'all' || mission.school === schoolFilter

    return matchesSearch && matchesStatus && matchesSport && matchesSchool
  })

  const handleFilterChange = (type: string, value: string) => {
    const filters = {
      status: statusFilter,
      sport: sportFilter,
      school: schoolFilter,
    }

    if (type === 'status') filters.status = value
    else if (type === 'sport') filters.sport = value
    else if (type === 'school') filters.school = value

    // APIを再呼び出し（フィルタリングが必要な場合）
    // fetchMissions(filters)

    // ローカル状態更新
    if (type === 'status') setStatusFilter(value)
    else if (type === 'sport') setSportFilter(value)
    else if (type === 'school') setSchoolFilter(value)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: tMissions('draft'), color: 'bg-gray-600' },
      in_progress: { label: tMissions('inProgress'), color: 'bg-blue-600' },
      completed: { label: tMissions('completed'), color: 'bg-green-600' },
      cancelled: { label: tMissions('cancelled'), color: 'bg-red-600' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-600'
    if (rate >= 50) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tMissions('loading')}</p>
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
          <Button onClick={() => window.location.reload()}>{tMissions('retry')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tMissions('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {tMissions('subtitle')}
          </p>
        </div>
        <Link href="/missions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {tMissions('newMission')}
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
                placeholder={tMissions('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder={tMissions('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tMissions('allStatuses')}</SelectItem>
                <SelectItem value="draft">{tMissions('draft')}</SelectItem>
                <SelectItem value="in_progress">{tMissions('inProgress')}</SelectItem>
                <SelectItem value="completed">{tMissions('completed')}</SelectItem>
                <SelectItem value="cancelled">{tMissions('cancelled')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sportFilter} onValueChange={(value) => handleFilterChange('sport', value)}>
              <SelectTrigger>
                <SelectValue placeholder={tMissions('filterBySport')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tMissions('allSports')}</SelectItem>
                <SelectItem value="soccer">{tMissions('soccer')}</SelectItem>
                <SelectItem value="basketball">{tMissions('basketball')}</SelectItem>
                <SelectItem value="baseball">{tMissions('baseball')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={schoolFilter} onValueChange={(value) => handleFilterChange('school', value)}>
              <SelectTrigger>
                <SelectValue placeholder={tMissions('filterBySchool')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tMissions('allSchools')}</SelectItem>
                <SelectItem value="ageo">{tMissions('ageoSchool')}</SelectItem>
                <SelectItem value="okegawa">{tMissions('okegawaSchool')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredMissions.length}{tMissions('missionCount')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {tMissions('completedCount')}{filteredMissions.filter(m => m.status === 'completed').length}{tMissions('items')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {tMissions('inProgressCount')}{filteredMissions.filter(m => m.status === 'in_progress').length}{tMissions('items')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ミッション一覧 */}
      <div className="grid gap-4">
        {filteredMissions.map((mission) => (
          <Card key={mission.id} className="relative">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* ヘッダー情報 */}
                  <div className="flex items-center gap-3">
                    {getStatusIcon(mission.status)}
                    <h3 className="text-lg font-semibold">{mission.title}</h3>
                    {getStatusBadge(mission.status)}
                  </div>

                  {/* メタ情報 */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{mission.student?.name} (Lv{mission.student?.level})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <span>{mission.coach?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(mission.lesson_date).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {mission.sport}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {mission.school === 'ageo' ? tMissions('ageoSchool') : tMissions('okegawaSchool')}
                    </Badge>
                  </div>

                  {/* 説明 */}
                  {mission.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mission.description}
                    </p>
                  )}

                  {/* プログレス */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {tMissions('progress')}: {mission.completion_rate || 0}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {mission.mission_items?.filter(item => item.completed_at).length || 0} / {mission.mission_items?.length || 0}{tMissions('itemsCompleted')}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getCompletionColor(mission.completion_rate || 0)}`}
                        style={{ width: `${mission.completion_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* アクションメニュー */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/missions/${mission.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        {tMissions('viewDetails')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/missions/${mission.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {tMissions('edit')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMissions.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {tMissions('noMissions')}
          </p>
          <p className="text-muted-foreground mb-4">
            {tMissions('noMissionsDesc')}
          </p>
          <Link href="/missions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {tMissions('newMission')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}