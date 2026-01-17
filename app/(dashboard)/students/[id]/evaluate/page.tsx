'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStudent } from '@/hooks/use-students'
import { useCoaches } from '@/hooks/use-coaches'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Loader2, Star, Trophy, Info, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { CreateEvaluationRequest } from '@/types/student'
import { SPORT_SKILLS } from '@/types/mission'

export default function EvaluateStudentPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const { student, loading: studentLoading, error: studentError } = useStudent(studentId)
  const { coaches, loading: coachesLoading } = useCoaches()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<CreateEvaluationRequest>({
    student_id: studentId,
    lesson_date: new Date().toISOString().split('T')[0],
    coach_id: '',
    school: 'ageo',
    training_type: 'regular',
    sport: 'soccer',
    category: 'technical',
    skill_item_id: '',
    rating: 2,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!formData.coach_id) {
        throw new Error('コーチを選択してください')
      }

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create evaluation')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/students/${studentId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '評価の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getSkillsForCategory = (sport: string, category: string) => {
    const sportSkills = SPORT_SKILLS[sport as keyof typeof SPORT_SKILLS] || SPORT_SKILLS.soccer
    return sportSkills[category as keyof typeof sportSkills] || []
  }

  const getRatingDescription = (rating: number) => {
    switch (rating) {
      case 1:
        return '⭐ 基本的な動作ができる'
      case 2:
        return '⭐⭐ 安定してできる'
      case 3:
        return '⭐⭐⭐ 非常に上手にできる'
      default:
        return ''
    }
  }

  const activeCoaches = coaches.filter(c => c.status === 'active')

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">生徒データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (studentError || !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{studentError || '生徒が見つかりません'}</p>
          <Link href="/students">
            <Button>生徒一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href={`/students/${studentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">スキル評価入力</h1>
          <p className="text-muted-foreground">
            {student.name}さんのスキル評価を入力
          </p>
        </div>
      </div>

      {/* 生徒情報概要 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.photo_url} alt={student.name} />
              <AvatarFallback className="text-xl">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{student.name}</h2>
              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  Lv{student.level}: {student.level_title}
                </Badge>
                <Badge variant="outline">
                  {student.school === 'ageo' ? '上尾校' : '桶川校'}
                </Badge>
                <Badge variant="secondary">
                  {student.class_type === 'preschool' ? '未就学児' : '小学生'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>評価基本情報</CardTitle>
              <CardDescription>
                レッスンの基本情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    評価を登録しました。生徒詳細ページに戻ります...
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="lesson_date">レッスン日 *</Label>
                  <Input
                    id="lesson_date"
                    type="date"
                    value={formData.lesson_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, lesson_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coach_id">評価者（コーチ） *</Label>
                  <Select
                    value={formData.coach_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, coach_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={coachesLoading ? "読み込み中..." : "コーチを選択"} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCoaches.map((coach) => (
                        <SelectItem key={coach.id} value={coach.id}>
                          {coach.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">校舎 *</Label>
                  <Select
                    value={formData.school}
                    onValueChange={(value: 'ageo' | 'okegawa') =>
                      setFormData(prev => ({ ...prev, school: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="校舎を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageo">上尾校</SelectItem>
                      <SelectItem value="okegawa">桶川校</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="training_type">レッスン種別</Label>
                  <Select
                    value={formData.training_type}
                    onValueChange={(value: 'regular' | 'special' | 'private') =>
                      setFormData(prev => ({ ...prev, training_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="レッスン種別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">通常レッスン</SelectItem>
                      <SelectItem value="special">特別レッスン</SelectItem>
                      <SelectItem value="private">プライベートレッスン</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport">スポーツ *</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value, skill_item_id: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="スポーツを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soccer">サッカー</SelectItem>
                      <SelectItem value="basketball">バスケットボール</SelectItem>
                      <SelectItem value="baseball">野球</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* スキル評価 */}
          <Card>
            <CardHeader>
              <CardTitle>スキル評価</CardTitle>
              <CardDescription>
                評価対象のスキルと星評価を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, skill_item_id: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">技術</SelectItem>
                      <SelectItem value="physical">体力・運動能力</SelectItem>
                      <SelectItem value="mental">メンタル</SelectItem>
                      <SelectItem value="teamwork">チームワーク</SelectItem>
                      <SelectItem value="communication">コミュニケーション</SelectItem>
                      <SelectItem value="strategy">戦略・戦術</SelectItem>
                      <SelectItem value="safety">安全性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skill_item_id">スキル項目 *</Label>
                  <Select
                    value={formData.skill_item_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, skill_item_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="スキル項目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSkillsForCategory(formData.sport, formData.category).map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 星評価 */}
              <div className="space-y-4">
                <Label>評価 *</Label>
                <div className="space-y-3">
                  {[1, 2, 3].map((rating) => (
                    <div
                      key={rating}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.rating === rating
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, rating }))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{getRatingDescription(rating)}</span>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                          {formData.rating === rating && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  同一カテゴリで⭐⭐⭐を3回獲得すると、自動的にバッジが授与されます！
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* コメント */}
          <Card>
            <CardHeader>
              <CardTitle>コメント・メモ</CardTitle>
              <CardDescription>
                評価の詳細や今後のアドバイスを記入してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">コメント</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="評価の詳細、改善点、褒めるポイント、次回の目標など..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end">
            <Link href={`/students/${studentId}`}>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !formData.skill_item_id}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? '登録中...' : '評価を登録'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}