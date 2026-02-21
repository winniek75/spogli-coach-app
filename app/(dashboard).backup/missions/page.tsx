'use client'

import { useState } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('all')
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
      draft: { label: '下書き', color: 'bg-gray-600' },
      in_progress: { label: '実施中', color: 'bg-blue-600' },
      completed: { label: '完了', color: 'bg-green-600' },
      cancelled: { label: 'キャンセル', color: 'bg-red-600' },
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
          <p className="text-muted-foreground">ミッションデータを読み込んでいます...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">ミッション管理</h1>
          <p className="text-muted-foreground mt-2">
            生徒の目標設定と進捗管理
          </p>
        </div>
        <Link href="/missions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規ミッション作成
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
                placeholder="タイトル、生徒名、コーチ名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="ステータスで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ステータス</SelectItem>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="in_progress">実施中</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
                <SelectItem value="cancelled">キャンセル</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sportFilter} onValueChange={(value) => handleFilterChange('sport', value)}>
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

            <Select value={schoolFilter} onValueChange={(value) => handleFilterChange('school', value)}>
              <SelectTrigger>
                <SelectValue placeholder="校舎で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全校舎</SelectItem>
                <SelectItem value="ageo">上尾校</SelectItem>
                <SelectItem value="okegawa">桶川校</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredMissions.length}件のミッション
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                完了: {filteredMissions.filter(m => m.status === 'completed').length}件
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                実施中: {filteredMissions.filter(m => m.status === 'in_progress').length}件
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
                      {mission.school === 'ageo' ? '上尾校' : '桶川校'}
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
                        進捗: {mission.completion_rate || 0}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {mission.mission_items?.filter(item => item.completed_at).length || 0} / {mission.mission_items?.length || 0} 項目完了
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
                        詳細表示
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/missions/${mission.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        編集
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
            ミッションが見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しいミッションを作成してください
          </p>
          <Link href="/missions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              ミッションを作成
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}