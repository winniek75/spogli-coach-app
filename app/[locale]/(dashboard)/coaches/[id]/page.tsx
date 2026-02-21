'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('coaches.detail')
  const coachId = params.id as string
  const { coach, loading, error } = useCoach(coachId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loadingCoach')}</p>
        </div>
      </div>
    )
  }

  if (error || !coach) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || t('coachNotFound')}</p>
          <Link href="/coaches">
            <Button>{t('backToList')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getSchoolBadges = (schools: string[]) => {
    return schools.map(school => (
      <Badge key={school} variant="secondary">
        {school === 'ageo' ? t('ageoSchool') : t('okegawaSchool')}
      </Badge>
    ))
  }

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      coach: t('roleCoach'),
      senior_coach: t('roleSeniorCoach'),
      manager: t('roleManager'),
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
        return <Badge className="bg-green-600">{t('certValid')}</Badge>
      case 'expiring_soon':
        return <Badge className="bg-amber-600">{t('certExpiringSoon')}</Badge>
      case 'expired':
        return <Badge variant="destructive">{t('certExpired')}</Badge>
      default:
        return <Badge variant="secondary">{t('certUnknown')}</Badge>
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
            <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
            <p className="text-muted-foreground">
              {t('detailInfo', { name: coach.name })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/coaches/${coach.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
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
                      {coach.status === 'active' ? t('statusActive') : t('statusInactive')}
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
                  {t('contactInfo')}
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
                  {t('basicInfo')}
                </h4>
                <div className="space-y-2 pl-6">
                  {coach.nationality && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('nationality')}</span>
                      <span>{coach.nationality}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('assignedSchools')}</span>
                    <div className="flex gap-1">
                      {getSchoolBadges(coach.schools)}
                    </div>
                  </div>
                  {coach.hire_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('hireDate')}</span>
                      <span>{new Date(coach.hire_date).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 対応言語 */}
              <div className="space-y-3">
                <h4 className="font-medium">{t('supportedLanguages')}</h4>
                <div className="flex flex-wrap gap-1 pl-6">
                  {(coach.languages || []).map((lang) => (
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
                    <h4 className="font-medium">{t('notes')}</h4>
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
              <CardTitle className="text-lg">{t('communication')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.location.href = `mailto:${coach.email}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                {t('sendEmail')}
              </Button>
              {coach.line_id && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => window.open(`https://line.me/R/ti/p/${coach.line_id}`, '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('sendLine')}
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
                  {t('certificationsTitle')}
                </CardTitle>
                <Link href={`/coaches/${coach.id}/certifications`}>
                  <Button size="sm">
                    <Award className="h-4 w-4 mr-2" />
                    {t('manageCertifications')}
                  </Button>
                </Link>
              </div>
              <CardDescription>
                {t('certificationsDescription')}
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
                            <span>{t('issuedDate')}: {new Date(cert.issued_date).toLocaleDateString('ja-JP')}</span>
                            {cert.expiry_date && (
                              <span>{t('expiryDate')}: {new Date(cert.expiry_date).toLocaleDateString('ja-JP')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getCertificationStatusBadge(cert.status)}
                        {cert.expiry_date && cert.status === 'expiring_soon' && (
                          <p className="text-xs text-amber-600 mt-1">
                            {t('daysRemaining', { days: Math.ceil((new Date(cert.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">{t('noCertifications')}</p>
                  <Link href={`/coaches/${coach.id}/certifications`}>
                    <Button size="sm">
                      <Award className="h-4 w-4 mr-2" />
                      {t('addCertification')}
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
                  {t('monthlyShifts')}
                </CardTitle>
                <Link href={`/schedule/shifts?coach=${coach.id}`}>
                  <Button size="sm" variant="outline">
                    {t('shiftsDetail')}
                  </Button>
                </Link>
              </div>
              <CardDescription>
                {t('monthlyWorkSchedule')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t('loadingShifts')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('shiftsInDevelopment')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}