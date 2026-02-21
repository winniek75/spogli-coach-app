'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Calendar,
  Plus,
  Search,
  Star,
  Users,
  Trophy,
  ClipboardList,
  Printer,
  Save,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'
import { useStudents } from '@/hooks/use-students'
import { useMissions } from '@/hooks/use-missions'
import { useCoaches } from '@/hooks/use-coaches'

const getSkillItems = (t: any) => ({
  volleyball: {
    catch: [
      { id: 'vb-catch-01', description: t('bothHandsForward'), level: 1 },
      { id: 'vb-catch-02', description: t('catchSlowBall'), level: 1 },
      { id: 'vb-catch-03', description: t('catchWhileMoving'), level: 2 },
    ],
    toss: [
      { id: 'vb-toss-01', description: t('underhandThrow'), level: 2 },
      { id: 'vb-toss-02', description: t('partnerToss'), level: 3 },
    ],
  },
  basketball: {
    dribble: [
      { id: 'bb-dribble-01', description: t('oneHandDribble'), level: 2 },
      { id: 'bb-dribble-02', description: t('walkingDribble'), level: 3 },
    ],
  },
})

export default function MissionPage() {
  const t = useTranslations('schedule.lessonMission')
  const { students, loading: studentsLoading } = useStudents()
  const { missionSheets, loading: missionsLoading, createMissionSheet, updateMissionItem } = useMissions()
  const { coaches, loading: coachesLoading } = useCoaches()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSport, setSelectedSport] = useState('volleyball')
  const [selectedSchool, setSelectedSchool] = useState('ageo')
  const [selectedClass, setSelectedClass] = useState('preschool')
  const [selectedCoach, setSelectedCoach] = useState('')
  const [evaluations, setEvaluations] = useState<{ [key: string]: number }>({})
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // 講師の初期値を設定
  useEffect(() => {
    if (coaches.length > 0 && !selectedCoach) {
      setSelectedCoach(coaches[0].id)
    }
  }, [coaches])

  const handleEvaluationChange = (studentId: string, skillId: string, rating: number) => {
    const key = `${studentId}-${skillId}`
    setEvaluations(prev => ({ ...prev, [key]: rating }))
  }

  const handleNotesChange = (studentId: string, skillId: string, note: string) => {
    const key = `${studentId}-${skillId}`
    setNotes(prev => ({ ...prev, [key]: note }))
  }

  const getStarRating = (studentId: string, skillId: string) => {
    const key = `${studentId}-${skillId}`
    const rating = evaluations[key] || 0

    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(star => (
          <button
            key={star}
            onClick={() => handleEvaluationChange(studentId, skillId, star)}
            className={`p-1 ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            <Star className="h-4 w-4 fill-current" />
          </button>
        ))}
      </div>
    )
  }

  const filteredStudents = students.filter(student =>
    student.class_type === selectedClass && student.school === selectedSchool
  )

  const skillItems = getSkillItems(t)
  const currentSkills = skillItems[selectedSport as keyof typeof skillItems] || {}

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      volleyball: '🏐',
      basketball: '🏀',
      soccer: '⚽',
      tennis: '🎾',
    }
    return icons[sport] || '🏃'
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
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            {t('print')}
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            {t('save')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">{t('createTab')}</TabsTrigger>
          <TabsTrigger value="history">{t('historyTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* レッスン情報設定 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('lessonInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('date')}</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t('sport')}</label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volleyball">{t('volleyball')}</SelectItem>
                      <SelectItem value="basketball">{t('basketball')}</SelectItem>
                      <SelectItem value="soccer">{t('soccer')}</SelectItem>
                      <SelectItem value="tennis">{t('tennis')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t('school')}</label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageo">{t('ageoSchool')}</SelectItem>
                      <SelectItem value="okegawa">{t('okegawaSchool')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t('class')}</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">{t('preschool')}</SelectItem>
                      <SelectItem value="elementary">{t('elementary')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {getSportIcon(selectedSport)} {filteredStudents.length}名
                    </div>
                    <div className="text-xs text-muted-foreground">{t('participatingStudents')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* スキル評価 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                {t('skillEvaluationSheet')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(currentSkills).map(([category, skills]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold capitalize">
                      {t(category)} ({skills.length} {t('items')})
                    </h3>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-48">{t('studentName')}</TableHead>
                            {skills.map(skill => (
                              <TableHead key={skill.id} className="text-center min-w-32">
                                <div className="text-xs">
                                  {skill.description}
                                  <Badge variant="outline" className="ml-1 text-xs">
                                    Lv{skill.level}
                                  </Badge>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map(student => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                <div>
                                  {student.name}
                                  <div className="text-xs text-muted-foreground">
                                    Lv{student.level}
                                  </div>
                                </div>
                              </TableCell>
                              {skills.map(skill => (
                                <TableCell key={skill.id} className="text-center">
                                  <div className="space-y-2">
                                    {getStarRating(student.id, skill.id)}
                                    <Textarea
                                      placeholder={t('memoPlaceholder')}
                                      className="text-xs h-16 resize-none"
                                      value={notes[`${student.id}-${skill.id}`] || ''}
                                      onChange={(e) => handleNotesChange(student.id, skill.id, e.target.value)}
                                    />
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}

                {Object.keys(currentSkills).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noSkillItems')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('missionSheetHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('sport')}</TableHead>
                    <TableHead>{t('school')}・{t('class')}</TableHead>
                    <TableHead>{t('coach')}</TableHead>
                    <TableHead>{t('participatingStudents')}</TableHead>
                    <TableHead>{t('evaluations')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="w-20">{t('operations')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missionSheets.map((sheet) => (
                    <TableRow key={sheet.id}>
                      <TableCell>
                        {new Date(sheet.lesson_date).toLocaleDateString('ja-JP')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getSportIcon(sheet.sport)}</span>
                          <span className="capitalize">{sheet.sport}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {sheet.school === 'ageo' ? t('ageoSchool') : t('okegawaSchool')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{sheet.coach?.name || '不明'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {sheet.student?.name || '不明'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {sheet.mission_items?.length || 0}件
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={sheet.completion_rate === 100 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {sheet.completion_rate === 100 ? t('completed') : t('inProgress')} ({sheet.completion_rate}%)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {missionSheets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('noHistory')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}