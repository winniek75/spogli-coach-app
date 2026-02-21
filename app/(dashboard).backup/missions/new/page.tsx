'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMissions } from '@/hooks/use-missions'
import { useStudents } from '@/hooks/use-students'
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
import { ArrowLeft, Loader2, Plus, Trash2, Info } from 'lucide-react'
import Link from 'next/link'
import {
  CreateMissionSheetRequest,
  CreateMissionItemRequest,
  SKILL_CATEGORIES,
  SPORT_SKILLS,
  SUCCESS_CRITERIA_TEMPLATES
} from '@/types/mission'

export default function NewMissionPage() {
  const router = useRouter()
  const { createMissionSheet } = useMissions()
  const { students, loading: studentsLoading } = useStudents()
  const { coaches, loading: coachesLoading } = useCoaches()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Omit<CreateMissionSheetRequest, 'mission_items'>>({
    student_id: '',
    coach_id: '',
    lesson_date: new Date().toISOString().split('T')[0],
    school: 'ageo',
    sport: 'soccer',
    title: '',
    description: '',
  })

  const [missionItems, setMissionItems] = useState<CreateMissionItemRequest[]>([
    {
      category: 'technical',
      target_description: '',
      success_criteria: '',
      order_index: 0,
    }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.student_id) {
        throw new Error('生徒を選択してください')
      }
      if (!formData.coach_id) {
        throw new Error('コーチを選択してください')
      }
      if (missionItems.length === 0) {
        throw new Error('ミッション項目を少なくとも1つ追加してください')
      }

      // 空のミッション項目をフィルタリング
      const validItems = missionItems.filter(item =>
        item.target_description.trim() && item.success_criteria.trim()
      )

      if (validItems.length === 0) {
        throw new Error('有効なミッション項目を入力してください')
      }

      const missionData: CreateMissionSheetRequest = {
        ...formData,
        title: formData.title || `${formData.sport} ミッション`,
        mission_items: validItems.map((item, index) => ({
          ...item,
          order_index: index,
        }))
      }

      const result = await createMissionSheet(missionData)
      router.push(`/missions/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ミッションシートの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const addMissionItem = () => {
    setMissionItems([
      ...missionItems,
      {
        category: 'technical',
        target_description: '',
        success_criteria: '',
        order_index: missionItems.length,
      }
    ])
  }

  const removeMissionItem = (index: number) => {
    if (missionItems.length > 1) {
      setMissionItems(missionItems.filter((_, i) => i !== index))
    }
  }

  const updateMissionItem = (index: number, field: keyof CreateMissionItemRequest, value: string) => {
    const updated = [...missionItems]
    updated[index] = { ...updated[index], [field]: value }
    setMissionItems(updated)
  }

  const getSkillsForSport = (sport: string) => {
    return SPORT_SKILLS[sport as keyof typeof SPORT_SKILLS] || SPORT_SKILLS.soccer
  }

  const getSkillItemsForCategory = (sport: string, category: string) => {
    const sportSkills = getSkillsForSport(sport)
    return sportSkills[category as keyof typeof sportSkills] || []
  }

  const activeStudents = students.filter(s => s.status === 'active')
  const activeCoaches = coaches.filter(c => c.status === 'active')

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/missions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新規ミッションシート作成</h1>
          <p className="text-muted-foreground">
            生徒の目標設定とスキル向上をサポートするミッションを作成
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                ミッションシートの基本的な情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="student_id">対象生徒 *</Label>
                  <Select
                    value={formData.student_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={studentsLoading ? "読み込み中..." : "生徒を選択"} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} (Lv{student.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coach_id">担当コーチ *</Label>
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
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="lesson_date">実施日 *</Label>
                  <Input
                    id="lesson_date"
                    type="date"
                    value={formData.lesson_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, lesson_date: e.target.value }))}
                    required
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="sport">スポーツ *</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
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

              <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="例: サッカー基本技術向上ミッション"
                />
                <p className="text-sm text-muted-foreground">
                  空欄の場合は「{formData.sport} ミッション」として自動設定されます
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="ミッションの目的や概要を説明してください..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* ミッション項目 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>ミッション項目</CardTitle>
                  <CardDescription>
                    具体的な目標とその達成基準を設定してください
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addMissionItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  項目追加
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {missionItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">ミッション項目 {index + 1}</h4>
                    {missionItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMissionItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>カテゴリ *</Label>
                      <Select
                        value={item.category}
                        onValueChange={(value) => updateMissionItem(index, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SKILL_CATEGORIES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>スキル項目</Label>
                      <Select
                        value={item.skill_item_id || ''}
                        onValueChange={(value) => {
                          updateMissionItem(index, 'skill_item_id', value)
                          // スキル項目が選択されたら、目標説明も自動設定
                          if (value && !item.target_description) {
                            updateMissionItem(index, 'target_description', `${value}を上達させる`)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="スキル項目を選択（任意）" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">カスタム項目</SelectItem>
                          {getSkillItemsForCategory(formData.sport, item.category).map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>目標説明 *</Label>
                      <Textarea
                        value={item.target_description}
                        onChange={(e) => updateMissionItem(index, 'target_description', e.target.value)}
                        placeholder="生徒が達成すべき具体的な目標を記述してください..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>成功基準 *</Label>
                      <Textarea
                        value={item.success_criteria}
                        onChange={(e) => updateMissionItem(index, 'success_criteria', e.target.value)}
                        placeholder="目標達成を判断する具体的な基準を記述してください..."
                        rows={2}
                      />
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          成功基準のテンプレート:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {SUCCESS_CRITERIA_TEMPLATES.map((template) => (
                            <Button
                              key={template}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateMissionItem(index, 'success_criteria', template)}
                            >
                              {template}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {missionItems.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    ミッション項目を追加してください
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end">
            <Link href="/missions">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? '作成中...' : 'ミッションシートを作成'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}