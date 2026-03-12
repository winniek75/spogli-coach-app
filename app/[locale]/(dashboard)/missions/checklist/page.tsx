'use client'

import { useState, useMemo } from 'react'
import { useStudents } from '@/hooks/use-students'
import { useCoaches } from '@/hooks/use-coaches'
import { useEvaluations } from '@/hooks/use-evaluations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Checkbox removed - using star-tap only
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Star,
  Trophy,
  Save,
  ClipboardCheck,
} from 'lucide-react'
import Link from 'next/link'
import { SPORT_SKILLS } from '@/data/skill-items'
import { SPORT_CATEGORIES, SPORT_LABELS } from '@/types/mission'
import { SPORT_SCHEDULE, type SportKey } from '@/types/badge'
import type { SkillItemWithBadge } from '@/types/badge'

// Sport icons
const SPORT_ICONS: Record<SportKey, string> = {
  soccer: '\u26BD',
  basketball: '\uD83C\uDFC0',
  baseball: '\u26BE',
  volleyball: '\uD83C\uDFD0',
  tennis: '\uD83C\uDFBE',
  rugby: '\uD83C\uDFC9',
}

// Get current month's sport
function getCurrentSport(): SportKey {
  const month = new Date().getMonth() + 1
  return SPORT_SCHEDULE[month]?.sport ?? 'soccer'
}

interface CheckedSkill {
  skillId: string
  rating: 1 | 2 | 3
}

export default function MissionChecklistPage() {
  const { students, loading: studentsLoading } = useStudents()
  const { coaches, loading: coachesLoading } = useCoaches()
  const { createEvaluation } = useEvaluations()

  const [studentId, setStudentId] = useState('')
  const [coachId, setCoachId] = useState('')
  const [school, setSchool] = useState<'ageo' | 'okegawa'>('ageo')
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0])
  const [sport, setSport] = useState<SportKey>(getCurrentSport())
  const [checkedSkills, setCheckedSkills] = useState<Record<string, CheckedSkill>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeStudents = students.filter(s => s.status === 'active')
  const activeCoaches = coaches.filter(c => c.status === 'active')

  const selectedStudent = activeStudents.find(s => s.id === studentId)
  const classType = selectedStudent?.class_type ?? 'preschool'

  // Get all skills for the selected sport
  const sportSkills = SPORT_SKILLS[sport]
  const categories = SPORT_CATEGORIES[sport] ?? {}

  // Count checked skills
  const totalSkills = useMemo(() => {
    return Object.values(sportSkills).reduce((sum, skills) => sum + skills.length, 0)
  }, [sportSkills])

  const checkedCount = Object.keys(checkedSkills).length
  const progressPercent = totalSkills > 0 ? Math.round((checkedCount / totalSkills) * 100) : 0

  // Tap a star: set rating (or remove if tapping same star again)
  const handleStarTap = (skillId: string, rating: 1 | 2 | 3) => {
    setCheckedSkills(prev => {
      const next = { ...prev }
      if (next[skillId]?.rating === rating) {
        // Same star tapped again → remove evaluation
        delete next[skillId]
      } else {
        next[skillId] = { skillId, rating }
      }
      return next
    })
  }

  // Save all checked skills as evaluations
  const handleSave = async () => {
    if (!studentId) {
      setError('生徒を選択してください')
      return
    }
    if (!coachId) {
      setError('コーチを選択してください')
      return
    }
    if (checkedCount === 0) {
      setError('少なくとも1つのスキルに星をつけてください')
      return
    }

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const student = activeStudents.find(s => s.id === studentId)
      const coach = activeCoaches.find(c => c.id === coachId)

      for (const [skillId, checked] of Object.entries(checkedSkills)) {
        // Find which category this skill belongs to
        let skillCategory = ''
        let skillItem: SkillItemWithBadge | undefined
        for (const [cat, skills] of Object.entries(sportSkills)) {
          const found = skills.find(s => s.id === skillId)
          if (found) {
            skillCategory = cat
            skillItem = found
            break
          }
        }

        if (!skillItem) continue

        await createEvaluation({
          student_id: studentId,
          student_name: student?.name ?? '',
          student_level: student?.level ?? 1,
          date: lessonDate,
          sport,
          category: skillCategory,
          skill: `${skillItem.descriptionJa} / ${skillItem.descriptionEn}`,
          rating: checked.rating,
          coach: coach?.name ?? '',
          notes: `Skill ID: ${skillId}`,
        })
      }

      setSaved(true)
      // Reset checked skills after saving
      setTimeout(() => {
        setCheckedSkills({})
        setSaved(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // Get badge condition label for a skill
  const getBadgeLabel = (skill: SkillItemWithBadge) => {
    if (skill.badgeCondition.preschool && skill.badgeCondition.elementary > 0) {
      return 'both'
    }
    if (skill.badgeCondition.preschool) return 'kids'
    if (skill.badgeCondition.elementary === 1) return 'elem1'
    if (skill.badgeCondition.elementary === 2) return 'elem2'
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/missions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            ミッションシート チェックリスト
          </h1>
          <p className="text-muted-foreground text-sm">
            生徒を選んで、スキルの星をタップするだけ
          </p>
        </div>
      </div>

      {/* Settings Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>生徒 *</Label>
              <Select value={studentId} onValueChange={(v) => { setStudentId(v); setCheckedSkills({}); }}>
                <SelectTrigger>
                  <SelectValue placeholder={studentsLoading ? '読み込み中...' : '生徒を選択'} />
                </SelectTrigger>
                <SelectContent>
                  {activeStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} (Lv{s.level} / {s.class_type === 'preschool' ? '未就学児' : '小学生'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>コーチ *</Label>
              <Select value={coachId} onValueChange={setCoachId}>
                <SelectTrigger>
                  <SelectValue placeholder={coachesLoading ? '読み込み中...' : 'コーチを選択'} />
                </SelectTrigger>
                <SelectContent>
                  {activeCoaches.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>校舎</Label>
              <Select value={school} onValueChange={(v: 'ageo' | 'okegawa') => setSchool(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ageo">上尾校</SelectItem>
                  <SelectItem value="okegawa">桶川校</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>レッスン日</Label>
              <Input
                type="date"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>スポーツ</Label>
              <Select value={sport} onValueChange={(v) => { setSport(v as SportKey); setCheckedSkills({}); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPORT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {SPORT_ICONS[key as SportKey]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student info banner */}
          {selectedStudent && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{selectedStudent.name}</div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Lv{selectedStudent.level}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      classType === 'preschool'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {classType === 'preschool' ? 'KIDS (未就学児)' : '小学生'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedStudent.school === 'ageo' ? '上尾校' : '桶川校'}
                  </Badge>
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl">{SPORT_ICONS[sport]}</div>
                <div className="text-xs text-muted-foreground">{SPORT_LABELS[sport]}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge condition legend */}
      <div className="flex flex-wrap gap-3 text-xs items-center px-1">
        <span className="text-muted-foreground font-medium">バッジ条件:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          KIDS バッジ条件
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          小学生バッジ条件
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'linear-gradient(135deg, #a78bfa 50%, #f59e0b 50%)' }}></span>
          両方のバッジ条件
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600/50"></span>
          通常スキル
        </span>
      </div>

      {/* Progress bar */}
      {studentId && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                評価済み: {checkedCount} / {totalSkills}
              </span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Error / Success alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {saved && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {checkedCount}件のスキル評価を保存しました！
          </AlertDescription>
        </Alert>
      )}

      {/* Skill Checklist by Category */}
      {!studentId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            上のフォームから生徒を選択してください
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
            const skills = sportSkills[categoryKey] ?? []
            const categoryChecked = skills.filter(s => checkedSkills[s.id]).length

            return (
              <Card key={categoryKey} className="overflow-hidden">
                <CardHeader className="py-3 px-4 bg-teal-50 dark:bg-teal-950/20 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-teal-700 dark:text-teal-400">
                        {categoryLabel}
                      </CardTitle>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {categoryKey}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {categoryChecked}/{skills.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {skills.map((skill) => {
                      const isChecked = !!checkedSkills[skill.id]
                      const badgeType = getBadgeLabel(skill)
                      const currentRating = checkedSkills[skill.id]?.rating ?? 0

                      // Determine dot color
                      let dotClass = 'bg-teal-600/40'
                      if (badgeType === 'kids') dotClass = 'bg-purple-500 shadow-[0_0_5px_rgba(167,139,250,0.5)]'
                      else if (badgeType === 'elem1' || badgeType === 'elem2') dotClass = 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]'
                      else if (badgeType === 'both') dotClass = 'bg-gradient-to-br from-purple-500 to-amber-500'

                      // Dim non-relevant badge items based on student class type
                      let dimmed = false
                      if (classType === 'preschool' && (badgeType === 'elem1' || badgeType === 'elem2')) dimmed = true
                      if (classType === 'elementary' && badgeType === 'kids') dimmed = true

                      return (
                        <div
                          key={skill.id}
                          className={`flex items-center gap-2.5 px-3 py-2 transition-colors ${
                            isChecked ? 'bg-green-50 dark:bg-green-950/20' : ''
                          } ${dimmed ? 'opacity-40' : ''}`}
                        >
                          {/* Stars - always visible, tap to rate */}
                          <div className="flex gap-0.5 shrink-0">
                            {[1, 2, 3].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => handleStarTap(skill.id, r as 1 | 2 | 3)}
                                className="p-0.5 rounded hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-colors touch-manipulation"
                              >
                                <Star
                                  className={`h-5 w-5 transition-colors ${
                                    r <= currentRating
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-1.5">
                              <span className={`text-sm leading-tight ${isChecked ? 'text-green-700 dark:text-green-400 font-medium' : ''}`}>
                                {skill.descriptionJa}
                              </span>
                              {badgeType && (
                                <div className="flex gap-0.5 shrink-0 mt-0.5">
                                  {(badgeType === 'kids' || badgeType === 'both') && (
                                    <span className="text-[9px] px-1 py-0 rounded border bg-purple-100 text-purple-700 border-purple-300 font-semibold leading-relaxed">
                                      KIDS
                                    </span>
                                  )}
                                  {badgeType === 'elem1' && (
                                    <span className="text-[9px] px-1 py-0 rounded border bg-amber-50 text-amber-700 border-amber-300 font-semibold leading-relaxed">
                                      {'\u5C0F\u5B66\u751F\u2460'}
                                    </span>
                                  )}
                                  {badgeType === 'elem2' && (
                                    <span className="text-[9px] px-1 py-0 rounded border bg-amber-50 text-amber-700 border-amber-300 font-semibold leading-relaxed">
                                      {'\u5C0F\u5B66\u751F\u2461'}
                                    </span>
                                  )}
                                  {badgeType === 'both' && (
                                    <span className="text-[9px] px-1 py-0 rounded border bg-amber-50 text-amber-700 border-amber-300 font-semibold leading-relaxed">
                                      {skill.badgeCondition.elementary === 1 ? '\u5C0F\u5B66\u751F\u2460' : '\u5C0F\u5B66\u751F\u2461'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {skill.descriptionEn}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Save Button (sticky bottom) */}
      {studentId && checkedCount > 0 && (
        <div className="sticky bottom-4 z-10">
          <Card className="shadow-lg border-primary/20">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="font-medium">
                  {checkedCount}件のスキルを評価済み
                </span>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="lg"
                className="min-w-[160px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    評価を保存
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Badge condition info */}
      {studentId && (
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="font-medium text-sm text-purple-800 dark:text-purple-300 mb-1">
                  KIDS バッジ条件（未就学児）
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  全5カテゴリで指定スキル <strong>1項目</strong> 達成 + <strong>&#11088;&#11088;&#11088;&#215;1回</strong>以上
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="font-medium text-sm text-amber-800 dark:text-amber-300 mb-1">
                  小学生バッジ条件
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  全5カテゴリで指定スキル <strong>2項目</strong> 達成（&#11088;&#11088;&#11088;は条件に含まない）
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
