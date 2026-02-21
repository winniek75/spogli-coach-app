'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMission, useMissions } from '@/hooks/use-missions'
import { useCoaches } from '@/hooks/use-coaches'
import { useStudents } from '@/hooks/use-students'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Users,
  Search,
  UserPlus,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { SPORT_SKILLS, SKILL_CATEGORIES, SUCCESS_CRITERIA_TEMPLATES } from '@/types/mission'

// デモ生徒データ
const demoStudents = [
  { id: 'student-1', name: '佐藤太郎', level: 3, age: 5, school: 'ageo' },
  { id: 'student-2', name: '田中花子', level: 4, age: 6, school: 'okegawa' },
  { id: 'student-3', name: '山田次郎', level: 2, age: 4, school: 'ageo' },
  { id: 'student-4', name: '鈴木美咲', level: 5, age: 6, school: 'okegawa' },
  { id: 'student-5', name: '高橋健太', level: 3, age: 5, school: 'ageo' },
  { id: 'student-6', name: '伊藤さくら', level: 4, age: 5, school: 'okegawa' },
  { id: 'student-7', name: '渡辺翔太', level: 2, age: 4, school: 'ageo' },
  { id: 'student-8', name: '中村ゆい', level: 5, age: 6, school: 'okegawa' }
]

export default function MissionEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { missionSheet, loading, error } = useMission(id)
  const { updateMissionSheet } = useMissions()
  const { coaches } = useCoaches()
  const { students } = useStudents()
  const tMissions = useTranslations('missions')
  const tCommon = useTranslations('common')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    student_id: '',
    coach_id: '',
    lesson_date: '',
    school: 'ageo' as 'ageo' | 'okegawa',
    sport: '',
    status: 'draft' as 'draft' | 'in_progress' | 'completed' | 'cancelled',
  })

  const [missionItems, setMissionItems] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [searchStudent, setSearchStudent] = useState('')

  const filteredStudents = demoStudents.filter(student =>
    student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.id.includes(searchStudent.toLowerCase())
  )

  const selectedStudent = demoStudents.find(s => s.id === formData.student_id)

  const getSkillOptions = () => {
    if (!formData.sport || !(formData.sport in SPORT_SKILLS)) return []
    const sportSkills = SPORT_SKILLS[formData.sport as keyof typeof SPORT_SKILLS]
    const options: { category: string, skills: string[] }[] = []

    Object.entries(sportSkills).forEach(([category, skills]) => {
      options.push({
        category: SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES] || category,
        skills: skills as string[]
      })
    })

    return options
  }

  useEffect(() => {
    if (missionSheet) {
      setFormData({
        title: missionSheet.title || '',
        description: missionSheet.description || '',
        student_id: missionSheet.student_id || '',
        coach_id: missionSheet.coach_id || '',
        lesson_date: missionSheet.lesson_date || '',
        school: missionSheet.school || 'ageo',
        sport: missionSheet.sport || '',
        status: missionSheet.status || 'draft',
      })
      setMissionItems(missionSheet.mission_items || [])
    }
  }, [missionSheet])

  const addMissionItem = () => {
    const newItem = {
      id: `new-item-${Date.now()}`,
      mission_sheet_id: id,
      category: 'technique',
      target_description: '',
      success_criteria: '',
      order_index: missionItems.length,
      completed_at: null,
      completion_notes: null,
    }
    setMissionItems([...missionItems, newItem])
  }

  const updateMissionItem = (index: number, field: string, value: string) => {
    const updated = missionItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setMissionItems(updated)
  }

  const removeMissionItem = (index: number) => {
    setMissionItems(missionItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateMissionSheet(id, {
        ...formData,
        mission_items: missionItems.filter(item =>
          item.target_description.trim() && item.success_criteria.trim()
        ),
      })

      router.push(`/missions/${id}`)
    } catch (error) {
      console.error('Error updating mission:', error)
      alert('ミッションシートの更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
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

  if (error || !missionSheet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || tMissions('notFound')}</p>
          <Button onClick={() => router.push('/missions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tCommon('back')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push(`/missions/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tMissions('editTitle')}</h1>
          <p className="text-muted-foreground">{tMissions('editSubtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle>{tMissions('basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>{tMissions('targetStudent')} *</Label>
                    {selectedStudent ? (
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium">{selectedStudent.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                レベル {selectedStudent.level} • {selectedStudent.age}歳
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowStudentDialog(true)}
                          >
                            {tCommon('change')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowStudentDialog(true)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {tMissions('selectStudent')}
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="title">{tMissions('titleLabel')} *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={tMissions('titlePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">{tMissions('description')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={tMissions('descriptionPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lesson_date">{tMissions('lessonDate')} *</Label>
                      <Input
                        id="lesson_date"
                        type="date"
                        value={formData.lesson_date}
                        onChange={(e) => setFormData({ ...formData, lesson_date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="sport">{tMissions('sport')} *</Label>
                      <Select
                        value={formData.sport}
                        onValueChange={(value) => setFormData({ ...formData, sport: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tMissions('selectSport')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soccer">サッカー</SelectItem>
                          <SelectItem value="basketball">バスケットボール</SelectItem>
                          <SelectItem value="volleyball">バレーボール</SelectItem>
                          <SelectItem value="tennis">テニス</SelectItem>
                          <SelectItem value="baseball">野球</SelectItem>
                          <SelectItem value="badminton">バドミントン</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ミッション項目 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>ミッション項目</CardTitle>
                  <Button type="button" variant="outline" onClick={addMissionItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    項目を追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missionItems.map((item, index) => (
                    <div key={item.id || index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">項目 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMissionItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>カテゴリー</Label>
                          <Select
                            value={item.category}
                            onValueChange={(value) => updateMissionItem(index, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(SKILL_CATEGORIES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.sport && (
                          <div>
                            <Label>スキル項目</Label>
                            <Select
                              value={item.skill_item_id || ''}
                              onValueChange={(value) => updateMissionItem(index, 'skill_item_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="スキルを選択" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="custom">カスタム項目</SelectItem>
                                {getSkillOptions().map((categoryGroup) => (
                                  categoryGroup.category === SKILL_CATEGORIES[item.category as keyof typeof SKILL_CATEGORIES] && (
                                    categoryGroup.skills.map((skill, skillIndex) => (
                                      <SelectItem key={skillIndex} value={`${formData.sport}-${skill.toLowerCase().replace(/・/g, '-').replace(/\s/g, '-')}`}>
                                        {skill}
                                      </SelectItem>
                                    ))
                                  )
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label>目標内容 *</Label>
                          <Input
                            value={item.target_description}
                            onChange={(e) => updateMissionItem(index, 'target_description', e.target.value)}
                            placeholder="例: 右足でのドリブル10m"
                            required
                          />
                        </div>

                        <div>
                          <Label>成功基準 *</Label>
                          <Select
                            value={item.success_criteria}
                            onValueChange={(value) => updateMissionItem(index, 'success_criteria', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="成功基準を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUCCESS_CRITERIA_TEMPLATES.map((template, templateIndex) => (
                                <SelectItem key={templateIndex} value={template}>
                                  {template}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            className="mt-2"
                            value={item.success_criteria}
                            onChange={(e) => updateMissionItem(index, 'success_criteria', e.target.value)}
                            placeholder="または独自の基準を入力..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {missionItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>ミッション項目が設定されていません。</p>
                      <p className="text-sm mt-1">「項目を追加」ボタンから追加してください。</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>設定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>担当コーチ *</Label>
                    <Select
                      value={formData.coach_id}
                      onValueChange={(value) => setFormData({ ...formData, coach_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="コーチを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>校舎 *</Label>
                    <Select
                      value={formData.school}
                      onValueChange={(value) => setFormData({ ...formData, school: value as 'ageo' | 'okegawa' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ageo">上尾校</SelectItem>
                        <SelectItem value="okegawa">桶川校</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>ステータス</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">下書き</SelectItem>
                        <SelectItem value="in_progress">進行中</SelectItem>
                        <SelectItem value="completed">完了</SelectItem>
                        <SelectItem value="cancelled">キャンセル</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクション */}
            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/missions/${id}`)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* 生徒選択ダイアログ */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>生徒を選択</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="生徒名で検索..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    formData.student_id === student.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setFormData({ ...formData, student_id: student.id })
                    setShowStudentDialog(false)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        レベル {student.level} • {student.age}歳 • {student.school === 'ageo' ? '上尾校' : '桶川校'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}