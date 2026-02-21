'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStudent } from '@/hooks/use-students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
} from 'lucide-react'
import Link from 'next/link'
import { StudentWithDetails, LEVELS } from '@/types/student'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const { student, loading, error } = useStudent(studentId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">生徒データを読み込んでいます...</p>
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

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            生徒が見つかりません
          </p>
          <p className="text-muted-foreground mb-4">
            指定された生徒は存在しないか、削除された可能性があります
          </p>
          <Link href="/students">
            <Button>生徒一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getLevelBadge = (level: number) => {
    const levelData = LEVELS[level as keyof typeof LEVELS]
    if (!levelData) return <Badge variant="secondary">不明</Badge>

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
      active: { label: '在籍中', color: 'bg-green-600' },
      inactive: { label: '休会', color: 'bg-gray-600' },
      withdrawn: { label: '退会', color: 'bg-red-600' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getRecentEvaluations = () => {
    if (!student.evaluations || student.evaluations.length === 0) return []
    return student.evaluations.slice(0, 5)
  }

  const calculateAverageRating = () => {
    if (!student.evaluations || student.evaluations.length === 0) return 0
    const total = student.evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0)
    return (total / student.evaluations.length).toFixed(1)
  }

  const getSportStats = () => {
    if (!student.evaluations || student.evaluations.length === 0) return {}

    const stats: { [sport: string]: { count: number; avgRating: number } } = {}

    student.evaluations.forEach(evaluation => {
      if (!stats[evaluation.sport]) {
        stats[evaluation.sport] = { count: 0, avgRating: 0 }
      }
      stats[evaluation.sport].count++
    })

    Object.keys(stats).forEach(sport => {
      const sportEvals = student.evaluations!.filter(e => e.sport === sport)
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
            生徒詳細・評価・進捗管理
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/students/${student.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          </Link>
          <Link href={`/students/${student.id}/evaluate`}>
            <Button>
              <Star className="h-4 w-4 mr-2" />
              評価入力
            </Button>
          </Link>
        </div>
      </div>

      {/* プロフィール概要 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photo_url} alt={student.name} />
              <AvatarFallback className="text-2xl">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {getLevelBadge(student.level)}
                {getStatusBadge(student.status)}
                <Badge variant="outline">
                  {student.school === 'ageo' ? '上尾校' : '桶川校'}
                </Badge>
                <Badge variant="secondary">
                  {student.class_type === 'preschool' ? '未就学児' : '小学生'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">年齢</p>
                  <p className="text-lg font-semibold">{student.age}歳</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">平均評価</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-semibold">{averageRating}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">バッジ数</p>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="text-lg font-semibold">{student.badges?.length || 0}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">出席率</p>
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
          <TabsTrigger value="info">基本情報</TabsTrigger>
          <TabsTrigger value="evaluations">評価履歴</TabsTrigger>
          <TabsTrigger value="badges">バッジ</TabsTrigger>
          <TabsTrigger value="attendance">出席記録</TabsTrigger>
          <TabsTrigger value="progress">進捗</TabsTrigger>
          <TabsTrigger value="notes">メモ</TabsTrigger>
        </TabsList>

        {/* 基本情報 */}
        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>個人情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">氏名</label>
                  <p className="text-sm">{student.name}</p>
                </div>
                {student.name_kana && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">ふりがな</label>
                    <p className="text-sm">{student.name_kana}</p>
                  </div>
                )}
                {student.name_en && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">英語名</label>
                    <p className="text-sm">{student.name_en}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">生年月日</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {new Date(student.birth_date).toLocaleDateString('ja-JP')} ({student.age}歳)
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">性別</label>
                  <p className="text-sm">
                    {student.gender === 'male' ? '男性' : student.gender === 'female' ? '女性' : 'その他'}
                  </p>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">入会日</label>
                  <p className="text-sm">
                    {new Date(student.enrollment_date).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>保護者情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">保護者氏名</label>
                  <p className="text-sm">{student.parent_name}</p>
                </div>
                {student.parent_email && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">メールアドレス</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{student.parent_email}</p>
                    </div>
                  </div>
                )}
                {student.parent_phone && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">電話番号</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{student.parent_phone}</p>
                    </div>
                  </div>
                )}
                {student.line_id && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">LINE ID</label>
                    <p className="text-sm">{student.line_id}</p>
                  </div>
                )}
                {student.emergency_contact && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-muted-foreground">緊急連絡先</label>
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
                    <p className="text-2xl font-bold">{student.evaluations?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">総評価数</p>
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
                    <p className="text-sm text-muted-foreground">平均評価</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Object.keys(sportStats).length}</p>
                    <p className="text-sm text-muted-foreground">種目数</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 種目別統計 */}
            {Object.keys(sportStats).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>種目別統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(sportStats).map(([sport, stats]) => (
                      <div key={sport} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{sport}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>評価数:</span>
                            <span>{stats.count}回</span>
                          </div>
                          <div className="flex justify-between">
                            <span>平均評価:</span>
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
                <CardTitle>最新の評価履歴</CardTitle>
                <CardDescription>直近5件の評価を表示しています</CardDescription>
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
                              {evaluation.coaches?.name && ` | ${evaluation.coaches.name}`}
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
                    <p className="text-muted-foreground">まだ評価がありません</p>
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
              <CardTitle>獲得バッジ</CardTitle>
              <CardDescription>
                各種目でレベル3の評価を3回獲得するとバッジが授与されます
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
                        獲得日: {new Date(badge.earned_date).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">まだバッジを獲得していません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 出席記録 */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>出席記録</CardTitle>
              <CardDescription>
                出席率: {student.attendance_rate}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.attendance && student.attendance.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {student.attendance
                    .sort((a, b) => new Date(b.lesson_date).getTime() - new Date(a.lesson_date).getTime())
                    .map((record) => (
                      <div key={record.id} className="flex justify-between items-center py-2 border-b">
                        <p className="text-sm">
                          {new Date(record.lesson_date).toLocaleDateString('ja-JP')}
                        </p>
                        <Badge
                          variant={record.status === 'present' ? 'default' : 'secondary'}
                          className={record.status === 'present' ? 'bg-green-600' : 'bg-gray-600'}
                        >
                          {record.status === 'present' ? '出席' : '欠席'}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">出席記録がありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 進捗 */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>学習進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-2">現在のレベル</p>
                  {getLevelBadge(student.level)}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">レベル進捗目安</p>
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
                    医療情報・アレルギー等
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
                    その他メモ
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
                    <p className="text-muted-foreground">メモがありません</p>
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