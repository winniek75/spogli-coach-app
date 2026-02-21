'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCoaches } from '@/hooks/use-coaches'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Users,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { CoachWithCertifications } from '@/types/coach'

export default function CoachesPage() {
  const t = useTranslations('coaches')
  const { coaches, loading, error } = useCoaches()
  const [searchTerm, setSearchTerm] = useState('')
  const params = useParams()
  const isEnglish = params.locale === 'en'

  const filteredCoaches = coaches.filter((coach) =>
    coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getExpiringCertifications = (coach: CoachWithCertifications) => {
    return coach.certifications?.filter(cert => cert.status === 'expiring_soon' || cert.status === 'expired') || []
  }

  const getSchoolBadges = (schools: string[]) => {
    return schools.map(school => (
      <Badge key={school} variant="secondary" className="text-xs">
        {school === 'ageo' ? '上尾校' : '桶川校'}
      </Badge>
    ))
  }

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      coach: '講師',
      senior_coach: 'シニア講師',
      manager: 'マネージャー',
    }

    const roleColors = {
      coach: 'bg-blue-100 text-blue-800',
      senior_coach: 'bg-purple-100 text-purple-800',
      manager: 'bg-green-100 text-green-800',
    }

    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {roleLabels[role as keyof typeof roleLabels] || role}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">講師データを読み込んでいます...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/coaches/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('addNew')}
          </Button>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredCoaches.length}{t('totalCoaches')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 講師一覧 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCoaches.map((coach) => {
          const expiringCerts = getExpiringCertifications(coach)

          return (
            <Card key={coach.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={coach.profile_image_url} alt={coach.name} />
                      <AvatarFallback>
                        {coach.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{coach.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {coach.nationality}
                      </p>
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
                        <Link href={`/coaches/${coach.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          詳細表示
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/coaches/${coach.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* ロールと校舎 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {getRoleBadge(coach.role)}
                  {getSchoolBadges(coach.schools)}
                </div>

                {/* 連絡先 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{coach.email}</span>
                  </div>
                  {coach.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{coach.phone}</span>
                    </div>
                  )}
                  {coach.line_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-3 w-3 text-muted-foreground" />
                      <span>{coach.line_id}</span>
                    </div>
                  )}
                </div>

                {/* 言語 */}
                <div className="flex flex-wrap gap-1">
                  {(coach.languages || []).map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>

                {/* 資格期限アラート */}
                {expiringCerts.length > 0 && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        資格期限注意
                      </span>
                    </div>
                    <div className="mt-1">
                      {expiringCerts.map((cert) => (
                        <p key={cert.id} className="text-xs text-amber-700">
                          {cert.name} - {cert.status === 'expired' ? '期限切れ' : '期限間近'}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* ステータス */}
                <div className="flex justify-between items-center pt-2">
                  <Badge
                    variant={coach.status === 'active' ? 'default' : 'secondary'}
                    className={coach.status === 'active' ? 'bg-green-600' : ''}
                  >
                    {coach.status === 'active' ? '在職中' : '退職'}
                  </Badge>
                  {coach.hire_date && (
                    <span className="text-xs text-muted-foreground">
                      入社: {new Date(coach.hire_date).toLocaleDateString('ja-JP')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCoaches.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            講師が見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            検索条件を変更するか、新しい講師を登録してください
          </p>
          <Link href="/coaches/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              講師を登録
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}