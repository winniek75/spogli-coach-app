'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCoach } from '@/hooks/use-coaches'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Award,
} from 'lucide-react'

export default function CoachDetailPage() {
  const params = useParams()
  const coachId = params.id as string
  const { coach, loading, error } = useCoach(coachId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">講師情報を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error || !coach) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || '講師が見つかりません'}</p>
          <Link href="/coaches">
            <Button>講師一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getSchoolBadges = (schools: string[]) => {
    return schools.map(school => (
      <Badge key={school} variant="secondary">
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

  const getCertificationStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'expiring_soon':
        return <Clock className="h-4 w-4 text-amber-600" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getCertificationStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-600">有効</Badge>
      case 'expiring_soon':
        return <Badge className="bg-amber-600">期限間近</Badge>
      case 'expired':
        return <Badge variant="destructive">期限切れ</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/coaches">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">講師詳細</h1>
            <p className="text-muted-foreground">
              {coach.name}の詳細情報
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/coaches/${coach.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左カラム：基本情報 */}
        <div className="lg:col-span-1 space-y-6">
          {/* プロフィール */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={coach.profile_image_url} alt={coach.name} />
                  <AvatarFallback className="text-2xl">
                    {coach.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{coach.name}</CardTitle>
                  {coach.name_en && (
                    <p className="text-lg text-muted-foreground">{coach.name_en}</p>
                  )}
                  <div className="flex gap-2">
                    {getRoleBadge(coach.role)}
                    <Badge
                      variant={coach.status === 'active' ? 'default' : 'secondary'}
                      className={coach.status === 'active' ? 'bg-green-600' : ''}
                    >
                      {coach.status === 'active' ? '在職中' : '退職'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 連絡先 */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  連絡先
                </h4>
                <div className="space-y-2 pl-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span>{coach.email}</span>
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
              </div>

              <Separator />

              {/* 基本情報 */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  基本情報
                </h4>
                <div className="space-y-2 pl-6">
                  {coach.nationality && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">国籍</span>
                      <span>{coach.nationality}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">担当校舎</span>
                    <div className="flex gap-1">
                      {getSchoolBadges(coach.schools)}
                    </div>
                  </div>
                  {coach.hire_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">入社日</span>
                      <span>{new Date(coach.hire_date).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 対応言語 */}
              <div className="space-y-3">
                <h4 className="font-medium">対応言語</h4>
                <div className="flex flex-wrap gap-1 pl-6">
                  {coach.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              {coach.notes && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">メモ</h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      {coach.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 連絡アクション */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">コミュニケーション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                メール送信
              </Button>
              {coach.line_id && (
                <Button className="w-full" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  LINE送信
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右カラム：資格・スケジュール */}
        <div className="lg:col-span-2 space-y-6">
          {/* 資格・認定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  資格・認定
                </CardTitle>
                <Link href={`/coaches/${coach.id}/certifications`}>
                  <Button size="sm">
                    <Award className="h-4 w-4 mr-2" />
                    資格管理
                  </Button>
                </Link>
              </div>
              <CardDescription>
                保有資格と有効期限の管理
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coach.certifications && coach.certifications.length > 0 ? (
                <div className="space-y-4">
                  {coach.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCertificationStatusIcon(cert.status)}
                        <div>
                          <h4 className="font-medium">{cert.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>発行日: {new Date(cert.issued_date).toLocaleDateString('ja-JP')}</span>
                            {cert.expiry_date && (
                              <span>有効期限: {new Date(cert.expiry_date).toLocaleDateString('ja-JP')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getCertificationStatusBadge(cert.status)}
                        {cert.expiry_date && cert.status === 'expiring_soon' && (
                          <p className="text-xs text-amber-600 mt-1">
                            残り{Math.ceil((new Date(cert.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}日
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">登録された資格がありません</p>
                  <Link href={`/coaches/${coach.id}/certifications`}>
                    <Button size="sm">
                      <Award className="h-4 w-4 mr-2" />
                      資格を追加
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 今月のシフト */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  今月のシフト
                </CardTitle>
                <Link href={`/schedule/shifts?coach=${coach.id}`}>
                  <Button size="sm" variant="outline">
                    シフト詳細
                  </Button>
                </Link>
              </div>
              <CardDescription>
                今月の勤務スケジュール
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">シフト情報を読み込み中...</p>
                <p className="text-sm text-muted-foreground">
                  シフト管理機能は開発中です
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}