'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBadges } from '@/hooks/use-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Search,
  MoreHorizontal,
  Trophy,
  Award,
  AlertTriangle,
  Calendar,
  Users,
  Star,
  Shield,
  Crown,
  Gift,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { BadgeWithStudent, BADGE_TYPES, BADGE_NAMES } from '@/types/badge'

export default function BadgesPage() {
  const { badges, loading, error, fetchBadges, awardBadge } = useBadges()
  const [searchTerm, setSearchTerm] = useState('all')
  const [sportFilter, setSportFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getBadgeName = (sport: string, category: string) => {
    const sportBadges = BADGE_NAMES[sport as keyof typeof BADGE_NAMES] || BADGE_NAMES.soccer
    return sportBadges[category as keyof typeof sportBadges] || `${sport} ${category}`
  }

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch =
      badge.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBadgeName(badge.sport, badge.category).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSport = sportFilter === 'all' || badge.sport === sportFilter
    const matchesType = typeFilter === 'all' || badge.badge_type === typeFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'awarded' && badge.awarded_date) ||
      (statusFilter === 'pending' && !badge.awarded_date)

    return matchesSearch && matchesSport && matchesType && matchesStatus
  })

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'sport') setSportFilter(value)
    else if (type === 'badge_type') setTypeFilter(value)
    else if (type === 'status') setStatusFilter(value)
  }

  const getBadgeIcon = (badgeType: string) => {
    return BADGE_TYPES[badgeType as keyof typeof BADGE_TYPES]?.icon || '🏆'
  }

  const getBadgeTypeInfo = (badgeType: string) => {
    return BADGE_TYPES[badgeType as keyof typeof BADGE_TYPES] || BADGE_TYPES.star
  }

  const handleAwardBadge = async (badgeId: string) => {
    try {
      await awardBadge(badgeId, {
        awarded_date: new Date().toISOString().split('T')[0],
        ceremony_completed: false,
      })
    } catch (err) {
      console.error('Error awarding badge:', err)
    }
  }

  const pendingBadges = badges.filter(b => !b.awarded_date)
  const awardedBadges = badges.filter(b => b.awarded_date)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">バッジデータを読み込んでいます...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">バッジ管理</h1>
          <p className="text-muted-foreground mt-2">
            生徒のバッジ獲得状況と授与式管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/badges/ceremony">
              <Gift className="h-4 w-4 mr-2" />
              授与式準備
            </Link>
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{badges.length}</p>
                <p className="text-sm text-muted-foreground">総バッジ数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{pendingBadges.length}</p>
                <p className="text-sm text-muted-foreground">授与待ち</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{awardedBadges.length}</p>
                <p className="text-sm text-muted-foreground">授与済み</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(badges.map(b => b.student_id)).size}
                </p>
                <p className="text-sm text-muted-foreground">獲得者数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="生徒名、バッジ名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

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

            <Select value={typeFilter} onValueChange={(value) => handleFilterChange('badge_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="バッジタイプで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全タイプ</SelectItem>
                <SelectItem value="star">⭐ スター</SelectItem>
                <SelectItem value="shield">🛡️ シールド</SelectItem>
                <SelectItem value="crown">👑 クラウン</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="ステータスで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ステータス</SelectItem>
                <SelectItem value="pending">授与待ち</SelectItem>
                <SelectItem value="awarded">授与済み</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* バッジ一覧 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBadges.map((badge) => {
          const badgeInfo = getBadgeTypeInfo(badge.badge_type)
          const badgeName = getBadgeName(badge.sport, badge.category)

          return (
            <Card key={badge.id} className={`relative ${!badge.awarded_date ? 'border-orange-200 bg-orange-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getBadgeIcon(badge.badge_type)}</div>
                    <div>
                      <CardTitle className="text-lg">{badgeName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{badge.category}</p>
                    </div>
                  </div>
                  {!badge.awarded_date && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      授与待ち
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* 生徒情報 */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {badge.student?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{badge.student?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Lv{badge.student?.level} | {badge.student?.school === 'ageo' ? '上尾校' : '桶川校'}
                    </p>
                  </div>
                </div>

                {/* バッジ詳細 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">バッジタイプ:</span>
                    <Badge className={badgeInfo.color}>
                      {badgeInfo.title}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">スポーツ:</span>
                    <Badge variant="outline">{badge.sport}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">獲得日:</span>
                    <span>{new Date(badge.earned_date).toLocaleDateString('ja-JP')}</span>
                  </div>
                  {badge.awarded_date && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">授与日:</span>
                      <span className="text-green-600 font-medium">
                        {new Date(badge.awarded_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>

                {/* アクション */}
                <div className="flex justify-between items-center pt-2">
                  {!badge.awarded_date ? (
                    <Button
                      size="sm"
                      onClick={() => handleAwardBadge(badge.id)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      授与する
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">授与済み</span>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/students/${badge.student_id}`}>
                          <Users className="h-4 w-4 mr-2" />
                          生徒詳細
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {badge.notes && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    {badge.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            バッジが見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更してください
          </p>
        </div>
      )}
    </div>
  )
}