'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const tMissions = useTranslations('missions')
  const tCommon = useTranslations('common')

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
        throw new Error(tMissions('selectStudentRequired'))
      }
      if (!formData.coach_id) {
        throw new Error(tMissions('selectCoachRequired'))
      }
      if (missionItems.length === 0) {
        throw new Error(tMissions('addAtLeastOneItem'))
      }

      // 空のミッション項目をフィルタリング
      const validItems = missionItems.filter(item =>
        item.target_description.trim() && item.success_criteria.trim()
      )

      if (validItems.length === 0) {
        throw new Error(tMissions('enterValidItem'))
      }

      const missionData: CreateMissionSheetRequest = {
        ...formData,
        title: formData.title || `${tMissions(formData.sport)} ${tMissions('mission')}`,
        mission_items: validItems.map((item, index) => ({
          ...item,
          order_index: index,
        }))
      }

      const result = await createMissionSheet(missionData)
      router.push(`/missions/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : tMissions('createFailed'))
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
          <h1 className="text-3xl font-bold tracking-tight">{tMissions('newMissionSheet')}</h1>
          <p className="text-muted-foreground">
            {tMissions('newMissionDescription')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>{tMissions('basicInfo')}</CardTitle>
              <CardDescription>
                {tMissions('enterBasicInfo')}
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
                  <Label htmlFor="student_id">{tMissions('targetStudent')} *</Label>
                  <Select
                    value={formData.student_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={studentsLoading ? tCommon('loading') : tMissions('selectStudent')} />
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
                  <Label htmlFor="coach_id">{tMissions('assignedCoach')} *</Label>
                  <Select
                    value={formData.coach_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, coach_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={coachesLoading ? tCommon('loading') : tMissions('selectCoach')} />
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
                  <Label htmlFor="lesson_date">{tMissions('implementationDate')} *</Label>
                  <Input
                    id="lesson_date"
                    type="date"
                    value={formData.lesson_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, lesson_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">{tMissions('school')} *</Label>
                  <Select
                    value={formData.school}
                    onValueChange={(value: 'ageo' | 'okegawa') =>
                      setFormData(prev => ({ ...prev, school: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tMissions('selectSchool')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageo">{tMissions('ageoSchool')}</SelectItem>
                      <SelectItem value="okegawa">{tMissions('okegawaSchool')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport">{tMissions('sports')} *</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tMissions('selectSport')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soccer">{tMissions('soccer')}</SelectItem>
                      <SelectItem value="basketball">{tMissions('basketball')}</SelectItem>
                      <SelectItem value="baseball">{tMissions('baseball')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">{tMissions('titleLabel')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={tMissions('titlePlaceholder')}
                />
                <p className="text-sm text-muted-foreground">
                  {tMissions('autoGeneratedTitle')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{tMissions('description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={tMissions('descriptionPlaceholder')}
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
                  <CardTitle>{tMissions('missionItems')}</CardTitle>
                  <CardDescription>
                    {tMissions('setConcreteGoals')}
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addMissionItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  {tMissions('addItem')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {missionItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">{tMissions('missionItem')} {index + 1}</h4>
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
                      <Label>{tMissions('category')} *</Label>
                      <Select
                        value={item.category}
                        onValueChange={(value) => updateMissionItem(index, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tMissions('selectCategory')} />
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
                      <Label>{tMissions('skillItem')}</Label>
                      <Select
                        value={item.skill_item_id || ''}
                        onValueChange={(value) => {
                          updateMissionItem(index, 'skill_item_id', value)
                          // スキル項目が選択されたら、目標説明も自動設定
                          if (value && !item.target_description) {
                            updateMissionItem(index, 'target_description', `${value}${tMissions('improveSkillSuffix')}`)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tMissions('selectSkillOptional')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">{tMissions('customItem')}</SelectItem>
                          {getSkillItemsForCategory(formData.sport, item.category)
                            .filter(skill => skill && skill.trim() !== '')
                            .map((skill) => (
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
                      <Label>{tMissions('targetDescription')} *</Label>
                      <Textarea
                        value={item.target_description}
                        onChange={(e) => updateMissionItem(index, 'target_description', e.target.value)}
                        placeholder={tMissions('targetDescriptionPlaceholder')}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{tMissions('successCriteria')} *</Label>
                      <Textarea
                        value={item.success_criteria}
                        onChange={(e) => updateMissionItem(index, 'success_criteria', e.target.value)}
                        placeholder={tMissions('successCriteriaPlaceholder')}
                        rows={2}
                      />
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {tMissions('successCriteriaTemplates')}:
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
                    {tMissions('pleaseAddMissionItems')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end">
            <Link href="/missions">
              <Button type="button" variant="outline">
                {tCommon('cancel')}
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? tCommon('creating') : tMissions('createMissionSheet')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}