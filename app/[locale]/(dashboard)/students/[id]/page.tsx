'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useStudent, useStudents } from '@/hooks/use-students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { convertGoogleDriveImageUrl, isGoogleDriveUrl } from '@/lib/google-drive-utils'
import {
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  Award,
  Star,
  TrendingUp,
  MessageSquare,
  Edit,
  FileText,
  Trophy,
  Target,
  Heart,
  Trash2,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { StudentWithDetails, LEVELS } from '@/types/student'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const { student, loading, error } = useStudent(studentId)
  const { withdrawStudent } = useStudents()
  const t = useTranslations('studentDetail')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {t('notFound')}
          </p>
          <p className="text-muted-foreground mb-4">
            {t('notFoundDesc')}
          </p>
          <Link href="/students">
            <Button>{t('backToList')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getLevelBadge = (level: number) => {
    const levelData = LEVELS[level as keyof typeof LEVELS]
    if (!levelData) return <Badge variant="secondary">{t('unknown')}</Badge>

    const badgeColors = {
      star: 'bg-yellow-100 text-yellow-800',
      shield: 'bg-blue-100 text-blue-800',
      crown: 'bg-purple-100 text-purple-800',
    }

    return (
      <Badge className={badgeColors[levelData.badge as keyof typeof badgeColors]}>
        Lv{level}: {levelData.title}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t('status.active'), color: 'bg-green-600' },
      inactive: { label: t('status.inactive'), color: 'bg-gray-600' },
      withdrawn: { label: t('status.withdrawn'), color: 'bg-red-600' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getRecentEvaluations = () => {
    if (!student.latest_evaluations || student.latest_evaluations.length === 0) return []
    return student.latest_evaluations.slice(0, 5)
  }

  const calculateAverageRating = () => {
    if (!student.latest_evaluations || student.latest_evaluations.length === 0) return 0
    const total = student.latest_evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0)
    return (total / student.latest_evaluations.length).toFixed(1)
  }

  const getSportStats = () => {
    if (!student.latest_evaluations || student.latest_evaluations.length === 0) return {}

    const stats: { [sport: string]: { count: number; avgRating: number } } = {}

    student.latest_evaluations.forEach(evaluation => {
      if (!stats[evaluation.sport]) {
        stats[evaluation.sport] = { count: 0, avgRating: 0 }
      }
      stats[evaluation.sport].count++
    })

    Object.keys(stats).forEach(sport => {
      const sportEvals = student.latest_evaluations!.filter(e => e.sport === sport)
      const total = sportEvals.reduce((sum, evaluation) => sum + evaluation.rating, 0)
      stats[sport].avgRating = parseFloat((total / sportEvals.length).toFixed(1))
    })

    return stats
  }

  const recentEvaluations = getRecentEvaluations()
  const averageRating = calculateAverageRating()
  const sportStats = getSportStats()

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Link href={`/students/${student.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
            </Button>
          </Link>
          <Link href={`/students/${student.id}/evaluate`}>
            <Button>
              <Star className="h-4 w-4 mr-2" />
              {t('evaluate')}
            </Button>
          </Link>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  {student.name}さんを退会処理しますか？
                </p>
                <p className="text-sm text-red-600 mt-1">
                  この操作はステータスを「退会」に変更します。データは保持されます。
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true)
                    try {
                      await withdrawStudent(studentId)
                      router.push('/students')
                    } catch (err) {
                      console.error(err)
                      setDeleting(false)
                      setShowDeleteConfirm(false)
                    }
                  }}
                >
                  {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {deleting ? '処理中...' : '退会処理する'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* プロフィール概要 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photo_url && isGoogleDriveUrl(student.photo_url) ? convertGoogleDriveImageUrl(student.photo_url, 'l') : student.photo_url} alt={student.name} />
              <AvatarFallback className="text-2xl">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {getLevelBadge(student.level)}
                {getStatusBadge(student.status)}
                <Badge variant="outline">
                  {student.school === 'ageo' ? t('school.ageo') : t('school.okegawa')}
                </Badge>
                <Badge variant="secondary">
                  {student.class_type === 'preschool' ? t('classType.preschool') : t('classType.elementary')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('age')}</p>
                  <p className="text-lg font-semibold">{t('ageValue', { age: student.age })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('averageRating')}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-semibold">{averageRating}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('badgeCount')}</p>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="text-lg font-semibold">{student.badges?.length || 0}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('attendanceRate')}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-lg font-semibold">{student.attendance_rate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タブセクション */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="info">{t('tabs.info')}</TabsTrigger>
          <TabsTrigger value="evaluations">{t('tabs.evaluations')}</TabsTrigger>
          <TabsTrigger value="badges">{t('tabs.badges')}</TabsTrigger>
          <TabsTrigger value="attendance">{t('tabs.attendance')}</TabsTrigger>
          <TabsTrigger value="progress">{t('tabs.progress')}</TabsTrigger>
          <TabsTrigger value="notes">{t('tabs.notes')}</TabsTrigger>
        </TabsList>

        {/* 基本情報 */}
        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('personalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('name')}</label>
                  <p className="text-sm">{student.name}</p>
                </div>
                {student.name_kana && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">{t('nameKana')}</label>
                    <p className="text-sm">{student.name_kana}</p>
                  </div>
                )}
                {student.name_en && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">{t('nameEn')}</label>
                    <p className="text-sm">{student.name_en}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('birthDate')}</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {new Date(student.birth_date).toLocaleDateString('ja-JP')} ({t('ageValue', { age: student.age })})
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('gender')}</label>
                  <p className="text-sm">
                    {student.gender === 'male' ? t('genderMale') : student.gender === 'female' ? t('genderFemale') : t('genderOther')}
                  </p>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('enrollmentDate')}</label>
                  <p className="text-sm">
                    {new Date(student.enrollment_date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('parentInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">{t('parentName')}</label>
                  <p className="text-sm">{student.parent_name}</p>
                </div>
                {student.parent_email && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{student.parent_email}</p>
                    </div>
                  </div>
                )}
                {student.parent_phone && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">{t('phone')}</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{student.parent_phone}</p>
                    </div>
                  </div>
                )}
                {student.line_id && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">{t('lineId')}</label>
                    <p className="text-sm">{student.line_id}</p>
                  </div>
                )}
                {student.emergency_contact && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">{t('emergencyContact')}</label>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <p className="text-sm">{student.emergency_contact}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 評価履歴 */}
        <TabsContent value="evaluations">
          <div className="space-y-6">
            {/* 統計情報 */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{student.latest_evaluations?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('totalEvaluations')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <p className="text-2xl font-bold">{averageRating}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{t('averageRating')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Object.keys(sportStats).length}</p>
                    <p className="text-sm text-muted-foreground">{t('sportCount')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 種目別統計 */}
            {Object.keys(sportStats).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('sportStatistics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(sportStats).map(([sport, stats]) => (
                      <div key={sport} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{sport}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>{t('evaluationCount')}:</span>
                            <span>{t('timesCount', { count: stats.count })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('averageRating')}:</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{stats.avgRating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 最新の評価履歴 */}
            <Card>
              <CardHeader>
                <CardTitle>{t('recentEvaluations')}</CardTitle>
                <CardDescription>{t('recentEvaluationsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {recentEvaluations.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvaluations.map((evaluation) => (
                      <div key={evaluation.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{evaluation.sport} - {evaluation.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(evaluation.lesson_date).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                          <div className="flex">
                            {[1, 2, 3].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= evaluation.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {evaluation.notes && (
                          <p className="text-sm text-muted-foreground">{evaluation.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('noEvaluations')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* バッジ */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>{t('earnedBadges')}</CardTitle>
              <CardDescription>
                {t('earnedBadgesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.badges && student.badges.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {student.badges.map((badge) => (
                    <div key={badge.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full ${
                          badge.badge_type === 'crown' ? 'bg-purple-100' :
                          badge.badge_type === 'shield' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        }`}>
                          <Trophy className={`h-5 w-5 ${
                            badge.badge_type === 'crown' ? 'text-purple-600' :
                            badge.badge_type === 'shield' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{badge.sport}</p>
                          <p className="text-sm text-muted-foreground">{badge.category}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('earnedDate')}: {new Date(badge.earned_date).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('noBadges')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 出席記録 */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>{t('attendanceRecord')}</CardTitle>
              <CardDescription>
                {t('attendanceRate')}: {student.attendance_rate}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-2xl font-bold">{student.attendance_rate}%</p>
                <p className="text-muted-foreground mt-2">{t('currentAttendanceRate')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 進捗 */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>{t('learningProgress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-2">{t('currentLevel')}</p>
                  {getLevelBadge(student.level)}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">{t('levelProgress')}</p>
                  <div className="space-y-2">
                    {Object.entries(LEVELS).map(([level, data]) => (
                      <div
                        key={level}
                        className={`flex items-center gap-2 p-2 rounded ${
                          parseInt(level) === student.level ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                        }`}
                      >
                        <Target className={`h-4 w-4 ${
                          parseInt(level) === student.level ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <span className="text-sm">
                          Lv{level}: {data.title} ({data.period})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* メモ */}
        <TabsContent value="notes">
          <div className="grid gap-6">
            {student.medical_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    {t('medicalNotes')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{student.medical_notes}</p>
                </CardContent>
              </Card>
            )}

            {student.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t('otherNotes')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
                </CardContent>
              </Card>
            )}

            {!student.medical_notes && !student.notes && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('noNotes')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
