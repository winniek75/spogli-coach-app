'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLessonSchedule } from '@/hooks/use-lesson-schedule'
import { useCoaches } from '@/hooks/use-coaches'
import { useStudents } from '@/hooks/use-students'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calendar,
  Plus,
  Search,
  Clock,
  Users,
  Trophy,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  AlertCircle,
} from 'lucide-react'

// レッスンフォームのデータ型
interface LessonFormData {
  date: string
  startTime: string
  endTime: string
  school: 'ageo' | 'okegawa'
  classType: 'preschool' | 'elementary'
  sport: string
  trainingType: string
  maxStudents: number
  notes?: string
}

const getSportIcon = (sport: string) => {
  const icons: { [key: string]: string } = {
    volleyball: '🏐',
    basketball: '🏀',
    soccer: '⚽',
    tennis: '🎾',
    tag_rugby: '🏉',
    baseball: '⚾',
  }
  return icons[sport] || '🏃'
}

// 日本時間の今日の日付をYYYY-MM-DD形式で取得
const getLocalDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ScheduleLessonsPage() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString())
  const tLessons = useTranslations('schedule.lessons')
  const tCommon = useTranslations('common')
  const [selectedSchool, setSelectedSchool] = useState('all')
  const [selectedSport, setSelectedSport] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filterByDate, setFilterByDate] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)

  // レッスンスケジュール、講師、生徒データを取得
  const { lessons, addLesson, updateLesson, deleteLesson } = useLessonSchedule()
  const { coaches } = useCoaches()
  const { students } = useStudents()

  // 参加生徒選択ダイアログ
  const [studentDialogLessonId, setStudentDialogLessonId] = useState<string | null>(null)
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [trialName, setTrialName] = useState('')
  const [trialAge, setTrialAge] = useState('')
  const [trialNotes, setTrialNotes] = useState('')

  // レッスンフォームの状態
  const [formData, setFormData] = useState<LessonFormData>({
    date: selectedDate,
    startTime: '10:00',
    endTime: '11:00',
    school: 'ageo',
    classType: 'preschool',
    sport: 'volleyball',
    trainingType: '',
    maxStudents: 12,
    notes: '',
  })

  const [selectedCoaches, setSelectedCoaches] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTrainingTypeBadge = (type: string) => {
    if (!type) return <Badge variant="secondary">未設定</Badge>
    return (
      <Badge className="bg-purple-100 text-purple-800">
        {type}
      </Badge>
    )
  }

  // レッスン作成処理
  const handleCreateLesson = () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      addLesson({
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        school: formData.school,
        classType: formData.classType,
        sport: formData.sport,
        trainingType: formData.trainingType,
        assignedCoaches: selectedCoaches,
        maxStudents: formData.maxStudents,
        enrolledCount: 0,
        status: 'scheduled',
        lessonMenu: null,
        notes: formData.notes,
      })

      // ダイアログを先に閉じる
      setIsAddDialogOpen(false)

      // フォームをリセット
      setFormData({
        date: selectedDate,
        startTime: '10:00',
        endTime: '11:00',
        school: 'ageo',
        classType: 'preschool',
        sport: 'volleyball',
        trainingType: '',
        maxStudents: 12,
        notes: '',
      })
      setSelectedCoaches([])
    } catch (error) {
      console.error('レッスンの作成に失敗しました:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // レッスン削除処理
  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('このレッスンを削除しますか？')) {
      await deleteLesson(lessonId)
    }
  }

  // 講師選択の切り替え
  const toggleCoachSelection = (coachName: string) => {
    setSelectedCoaches(prev =>
      prev.includes(coachName)
        ? prev.filter(c => c !== coachName)
        : [...prev, coachName]
    )
  }

  // 編集用フォームデータ
  const editingLesson = lessons.find(l => l.id === editingLessonId)
  const [editFormData, setEditFormData] = useState<LessonFormData | null>(null)
  const [editCoaches, setEditCoaches] = useState<string[]>([])

  const startEditLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return
    setEditFormData({
      date: lesson.date,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      school: lesson.school,
      classType: lesson.classType,
      sport: lesson.sport,
      trainingType: lesson.trainingType,
      maxStudents: lesson.maxStudents,
      notes: lesson.notes || '',
    })
    setEditCoaches([...lesson.assignedCoaches])
    setEditingLessonId(lessonId)
  }

  const handleUpdateLesson = () => {
    if (!editingLessonId || !editFormData) return
    updateLesson(editingLessonId, {
      date: editFormData.date,
      startTime: editFormData.startTime,
      endTime: editFormData.endTime,
      school: editFormData.school,
      classType: editFormData.classType,
      sport: editFormData.sport,
      trainingType: editFormData.trainingType,
      maxStudents: editFormData.maxStudents,
      assignedCoaches: editCoaches,
      notes: editFormData.notes,
    })
    setEditingLessonId(null)
    setEditFormData(null)
  }

  const toggleEditCoach = (coachName: string) => {
    setEditCoaches(prev =>
      prev.includes(coachName)
        ? prev.filter(c => c !== coachName)
        : [...prev, coachName]
    )
  }

  const today = getLocalDateString()

  const filteredLessons = (() => {
    // まず校舎・スポーツ・検索でフィルタ
    let filtered = lessons.filter(lesson => {
      const matchesSchool = selectedSchool === 'all' || lesson.school === selectedSchool
      const matchesSport = selectedSport === 'all' || lesson.sport === selectedSport
      const matchesSearch =
        !searchTerm ||
        lesson.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.assignedCoaches.some(coach => coach.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lesson.lessonMenu?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSchool && matchesSport && matchesSearch
    })

    if (filterByDate) {
      // 日付フィルタON: 選択した日付のみ
      filtered = filtered.filter(lesson => lesson.date === selectedDate)
    } else {
      // 日付フィルタOFF: 今日以降の直近8件を表示
      filtered = filtered
        .filter(lesson => lesson.date >= today)
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) return dateCompare
          return a.startTime.localeCompare(b.startTime)
        })
        .slice(0, 8)
    }

    return filtered
  })()

  const getSchoolBadge = (school: string) => (
    <Badge variant="outline" className="text-xs">
      {school === 'ageo' ? tLessons('ageoSchool') : tLessons('okegawaSchool')}
    </Badge>
  )

  const getClassTypeBadge = (classType: string) => (
    <Badge variant="secondary" className="text-xs">
      {classType === 'preschool' ? tLessons('preschool') : tLessons('elementary')}
    </Badge>
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: tLessons('scheduled'), color: 'bg-blue-100 text-blue-800' },
      confirmed: { label: tLessons('confirmed'), color: 'bg-green-100 text-green-800' },
      in_progress: { label: tLessons('inProgress'), color: 'bg-orange-100 text-orange-800' },
      completed: { label: tLessons('completed'), color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: tLessons('cancelled'), color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getEnrollmentStatus = (enrolled: number, max: number) => {
    const percentage = (enrolled / max) * 100
    if (percentage >= 100) {
      return { text: tLessons('full'), color: 'text-red-600', icon: <AlertCircle className="h-3 w-3" /> }
    } else if (percentage >= 80) {
      return { text: tLessons('almostFull'), color: 'text-orange-600', icon: <Users className="h-3 w-3" /> }
    } else {
      return { text: tLessons('available'), color: 'text-green-600', icon: <Users className="h-3 w-3" /> }
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tLessons('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {tLessons('subtitle')}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {tLessons('createLesson')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{tLessons('newLesson')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 基本情報 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="date">{tLessons('date')}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="school">{tLessons('school')}</Label>
                  <Select
                    value={formData.school}
                    onValueChange={(value: 'ageo' | 'okegawa') =>
                      setFormData(prev => ({ ...prev, school: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageo">{tLessons('ageoSchool')}</SelectItem>
                      <SelectItem value="okegawa">{tLessons('okegawaSchool')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 時間設定 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="startTime">{tLessons('startTime')}</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">{tLessons('endTime')}</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              {/* クラスとスポーツ */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="classType">{tLessons('classType')}</Label>
                  <Select
                    value={formData.classType}
                    onValueChange={(value: 'preschool' | 'elementary') =>
                      setFormData(prev => ({ ...prev, classType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">{tLessons('preschool')}</SelectItem>
                      <SelectItem value="elementary">{tLessons('elementary')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sport">{tLessons('sport')}</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volleyball">{tLessons('volleyball')}</SelectItem>
                      <SelectItem value="basketball">{tLessons('basketball')}</SelectItem>
                      <SelectItem value="soccer">{tLessons('soccer')}</SelectItem>
                      <SelectItem value="tennis">{tLessons('tennis')}</SelectItem>
                      <SelectItem value="tag_rugby">タグラグビー</SelectItem>
                      <SelectItem value="baseball">{tLessons('baseball')}</SelectItem>
                      <SelectItem value="badminton">バドミントン</SelectItem>
                      <SelectItem value="dance">ダンス</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* トレーニングタイプと定員 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="trainingType">{tLessons('training')}</Label>
                  <Input
                    id="trainingType"
                    value={formData.trainingType}
                    onChange={(e) => setFormData(prev => ({ ...prev, trainingType: e.target.value }))}
                    placeholder="例: コーディネーション、ビジョン、リズム等"
                  />
                </div>

                <div>
                  <Label htmlFor="maxStudents">{tLessons('maxStudents')}</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              {/* 講師選択 */}
              <div>
                <Label>{tLessons('assignedCoach')}</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {coaches.length > 0 ? (
                    coaches.map((coach) => (
                      <div key={coach.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`coach-${coach.id}`}
                          checked={selectedCoaches.includes(coach.name)}
                          onCheckedChange={() => toggleCoachSelection(coach.name)}
                        />
                        <Label htmlFor={`coach-${coach.id}`} className="text-sm">
                          {coach.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      講師データを読み込んでいます...
                    </div>
                  )}
                </div>
                {selectedCoaches.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCoaches.map(coach => (
                      <Badge key={coach} variant="secondary" className="text-xs">
                        {coach}
                        <button
                          onClick={() => toggleCoachSelection(coach)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* メモ */}
              <div>
                <Label htmlFor="notes">{tLessons('notes')}</Label>
                <Textarea
                  id="notes"
                  placeholder="レッスンに関するメモ（オプション）"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleCreateLesson}
                disabled={isSubmitting}
              >
                {isSubmitting ? '作成中...' : tLessons('createLesson')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredLessons.length}</div>
              <div className="text-xs text-muted-foreground">{tLessons('todayLessons')}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredLessons.filter(l => l.status === 'confirmed').length}
              </div>
              <div className="text-xs text-muted-foreground">{tLessons('confirmed')}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredLessons.reduce((sum, lesson) => sum + lesson.enrolledCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">{tLessons('scheduledStudents')}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredLessons.flatMap(l => l.assignedCoaches)).size}
              </div>
              <div className="text-xs text-muted-foreground">{tLessons('assignedCoaches')}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">{tLessons('date')}</label>
                <button
                  className={`text-xs px-2 py-0.5 rounded ${filterByDate ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}
                  onClick={() => setFilterByDate(!filterByDate)}
                >
                  {filterByDate ? '日付フィルタON' : '直近8件表示'}
                </button>
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setFilterByDate(true) }}
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 mt-6" />
              <label className="text-sm font-medium mb-2 block">{tLessons('search')}</label>
              <Input
                placeholder={tLessons('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{tLessons('school')}</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder={tLessons('filterBySchool')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tLessons('allSchools')}</SelectItem>
                  <SelectItem value="ageo">{tLessons('ageoSchool')}</SelectItem>
                  <SelectItem value="okegawa">{tLessons('okegawaSchool')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{tLessons('sport')}</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder={tLessons('filterBySport')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tLessons('allSports')}</SelectItem>
                  <SelectItem value="volleyball">{tLessons('volleyball')}</SelectItem>
                  <SelectItem value="basketball">{tLessons('basketball')}</SelectItem>
                  <SelectItem value="soccer">{tLessons('soccer')}</SelectItem>
                  <SelectItem value="tennis">{tLessons('tennis')}</SelectItem>
                  <SelectItem value="tag_rugby">タグラグビー</SelectItem>
                  <SelectItem value="baseball">{tLessons('baseball')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filteredLessons.length} {tLessons('lessonsCount')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* レッスン一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filterByDate
              ? `${tLessons('lessonList')} - ${new Date(selectedDate).toLocaleDateString()}`
              : `${tLessons('lessonList')}（直近${filteredLessons.length}件）`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tLessons('time')}</TableHead>
                <TableHead>{tLessons('sport')}</TableHead>
                <TableHead>{tLessons('schoolClass')}</TableHead>
                <TableHead>{tLessons('training')}</TableHead>
                <TableHead>{tLessons('assignedCoach')}</TableHead>
                <TableHead>{tLessons('participants')}</TableHead>
                <TableHead>{tLessons('status')}</TableHead>
                <TableHead>{tLessons('menu')}</TableHead>
                <TableHead className="w-20">{tLessons('operations')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => {
                const enrollmentStatus = getEnrollmentStatus(lesson.enrolledCount, lesson.maxStudents)

                return (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      <div>
                        {!filterByDate && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(lesson.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {lesson.startTime} - {lesson.endTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSportIcon(lesson.sport)}</span>
                        <span className="font-medium capitalize">{lesson.sport}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {getSchoolBadge(lesson.school)}
                        {getClassTypeBadge(lesson.classType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTrainingTypeBadge(lesson.trainingType)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lesson.assignedCoaches.map(coach => (
                          <Badge key={coach} variant="outline" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {coach}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        className="flex flex-col items-start hover:bg-muted/50 rounded px-1 py-0.5 transition-colors w-full text-left"
                        onClick={() => { setStudentDialogLessonId(lesson.id); setStudentSearchTerm(''); setTrialName(''); setTrialAge(''); setTrialNotes('') }}
                      >
                        <div className="flex items-center gap-1">
                          <span className={enrollmentStatus.color}>{enrollmentStatus.icon}</span>
                          <span className="font-medium">
                            {(lesson.enrolledStudents?.length || 0)}{lesson.trialParticipants?.length ? `+${lesson.trialParticipants.length}体験` : ''}/{lesson.maxStudents}
                          </span>
                          <span className="text-xs text-blue-600 ml-1">
                            {(lesson.enrolledStudents?.length || 0) > 0 || (lesson.trialParticipants?.length || 0) > 0 ? '編集' : '+生徒'}
                          </span>
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lesson.status)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {lesson.lessonMenu ? (
                        <span className="text-blue-600 cursor-pointer hover:underline">
                          {lesson.lessonMenu}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{tLessons('notSet')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEditLesson(lesson.id)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredLessons.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{tLessons('noLessons')}</p>
              <p className="text-sm mt-2">{tLessons('changeConditions')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* レッスン編集ダイアログ */}
      <Dialog open={!!editingLessonId} onOpenChange={(open) => { if (!open) { setEditingLessonId(null); setEditFormData(null) } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>レッスン編集</DialogTitle>
          </DialogHeader>
          {editFormData && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{tLessons('date')}</Label>
                  <Input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, date: e.target.value } : prev)}
                  />
                </div>
                <div>
                  <Label>{tLessons('school')}</Label>
                  <Select value={editFormData.school} onValueChange={(v: 'ageo' | 'okegawa') => setEditFormData(prev => prev ? { ...prev, school: v } : prev)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageo">{tLessons('ageoSchool')}</SelectItem>
                      <SelectItem value="okegawa">{tLessons('okegawaSchool')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{tLessons('startTime')}</Label>
                  <Input type="time" value={editFormData.startTime} onChange={(e) => setEditFormData(prev => prev ? { ...prev, startTime: e.target.value } : prev)} />
                </div>
                <div>
                  <Label>{tLessons('endTime')}</Label>
                  <Input type="time" value={editFormData.endTime} onChange={(e) => setEditFormData(prev => prev ? { ...prev, endTime: e.target.value } : prev)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{tLessons('classType')}</Label>
                  <Select value={editFormData.classType} onValueChange={(v: 'preschool' | 'elementary') => setEditFormData(prev => prev ? { ...prev, classType: v } : prev)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">{tLessons('preschool')}</SelectItem>
                      <SelectItem value="elementary">{tLessons('elementary')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{tLessons('sport')}</Label>
                  <Select value={editFormData.sport} onValueChange={(v) => setEditFormData(prev => prev ? { ...prev, sport: v } : prev)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volleyball">{tLessons('volleyball')}</SelectItem>
                      <SelectItem value="basketball">{tLessons('basketball')}</SelectItem>
                      <SelectItem value="soccer">{tLessons('soccer')}</SelectItem>
                      <SelectItem value="tennis">{tLessons('tennis')}</SelectItem>
                      <SelectItem value="tag_rugby">タグラグビー</SelectItem>
                      <SelectItem value="baseball">{tLessons('baseball')}</SelectItem>
                      <SelectItem value="badminton">バドミントン</SelectItem>
                      <SelectItem value="dance">ダンス</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{tLessons('training')}</Label>
                  <Input value={editFormData.trainingType} onChange={(e) => setEditFormData(prev => prev ? { ...prev, trainingType: e.target.value } : prev)} placeholder="例: コーディネーション等" />
                </div>
                <div>
                  <Label>{tLessons('maxStudents')}</Label>
                  <Input type="number" min="1" max="30" value={editFormData.maxStudents} onChange={(e) => setEditFormData(prev => prev ? { ...prev, maxStudents: parseInt(e.target.value) || 1 } : prev)} />
                </div>
              </div>
              <div>
                <Label>{tLessons('assignedCoach')}</Label>
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                  {coaches.map(coach => (
                    <div key={coach.id} className="flex items-center space-x-2">
                      <Checkbox checked={editCoaches.includes(coach.name)} onCheckedChange={() => toggleEditCoach(coach.name)} />
                      <Label className="text-sm">{coach.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>{tLessons('notes')}</Label>
                <Textarea value={editFormData.notes || ''} onChange={(e) => setEditFormData(prev => prev ? { ...prev, notes: e.target.value } : prev)} rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingLessonId(null); setEditFormData(null) }}>キャンセル</Button>
            <Button onClick={handleUpdateLesson}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 参加生徒選択ダイアログ */}
      <Dialog open={!!studentDialogLessonId} onOpenChange={(open) => { if (!open) setStudentDialogLessonId(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>参加者管理</DialogTitle>
          </DialogHeader>
          {(() => {
            const lesson = lessons.find(l => l.id === studentDialogLessonId)
            if (!lesson) return null
            const enrolled = lesson.enrolledStudents || []
            const trials = lesson.trialParticipants || []

            // 校舎・クラスでフィルタした生徒リスト
            const availableStudents = students
              .filter(s => s.status === 'active')
              .filter(s => !lesson.school || s.school === lesson.school)
              .filter(s => !lesson.classType || s.class_type === lesson.classType)
              .filter(s =>
                !studentSearchTerm ||
                s.name.includes(studentSearchTerm) ||
                (s.name_kana && s.name_kana.includes(studentSearchTerm))
              )

            const addTrialParticipant = () => {
              if (!trialName.trim()) return
              const newTrials = [...trials, { name: trialName.trim(), age: trialAge.trim(), notes: trialNotes.trim() }]
              updateLesson(lesson.id, { trialParticipants: newTrials })
              setTrialName('')
              setTrialAge('')
              setTrialNotes('')
            }

            const removeTrialParticipant = (index: number) => {
              const newTrials = trials.filter((_, i) => i !== index)
              updateLesson(lesson.id, { trialParticipants: newTrials })
            }

            return (
              <div className="space-y-4">
                {/* 在籍生徒セクション */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold">在籍生徒</Label>
                    <span className="text-xs text-muted-foreground">
                      {lesson.school === 'ageo' ? '上尾校' : '桶川校'} / {lesson.classType === 'preschool' ? '幼児' : '小学生'}
                    </span>
                  </div>
                  <Input
                    placeholder="名前で検索..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {availableStudents.length > 0 ? (
                      availableStudents.map(student => (
                        <label
                          key={student.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                        >
                          <Checkbox
                            checked={enrolled.includes(student.name)}
                            onCheckedChange={(checked) => {
                              const newEnrolled = checked
                                ? [...enrolled, student.name]
                                : enrolled.filter(n => n !== student.name)
                              updateLesson(lesson.id, {
                                enrolledStudents: newEnrolled,
                                enrolledCount: newEnrolled.length + trials.length,
                              })
                            }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{student.name}</div>
                            {student.name_kana && (
                              <div className="text-xs text-muted-foreground">{student.name_kana}</div>
                            )}
                          </div>
                          {enrolled.includes(student.name) && (
                            <Badge variant="secondary" className="text-xs">参加</Badge>
                          )}
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-3 text-sm text-muted-foreground">
                        該当する生徒がいません
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-muted-foreground">{enrolled.length}名 選択中</span>
                    {enrolled.length > 0 && (
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => updateLesson(lesson.id, { enrolledStudents: [], enrolledCount: trials.length })}
                      >
                        全解除
                      </button>
                    )}
                  </div>
                </div>

                {/* 体験参加セクション */}
                <div>
                  <Label className="text-sm font-semibold">体験参加</Label>

                  {/* 登録済み体験参加者 */}
                  {trials.length > 0 && (
                    <div className="space-y-2 mt-2 mb-3">
                      {trials.map((trial, index) => (
                        <div key={index} className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                          <Badge className="bg-orange-100 text-orange-800 text-xs">体験</Badge>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{trial.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {trial.age && `${trial.age}歳`}
                              {trial.age && trial.notes && ' / '}
                              {trial.notes}
                            </div>
                          </div>
                          <button
                            className="text-red-400 hover:text-red-600 text-sm"
                            onClick={() => removeTrialParticipant(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 体験参加者追加フォーム */}
                  <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">名前 *</Label>
                        <Input
                          value={trialName}
                          onChange={(e) => setTrialName(e.target.value)}
                          placeholder="体験者の名前"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">年齢</Label>
                        <Input
                          value={trialAge}
                          onChange={(e) => setTrialAge(e.target.value)}
                          placeholder="例: 5"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">備考（連絡先・アレルギー等）</Label>
                      <Input
                        value={trialNotes}
                        onChange={(e) => setTrialNotes(e.target.value)}
                        placeholder="例: 保護者 090-xxxx-xxxx / 卵アレルギー"
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={addTrialParticipant}
                      disabled={!trialName.trim()}
                    >
                      + 体験参加者を追加
                    </Button>
                  </div>
                </div>

                {/* 合計 */}
                <div className="text-sm text-center text-muted-foreground border-t pt-3">
                  合計: <span className="font-semibold text-foreground">{enrolled.length + trials.length}</span>名 / {lesson.maxStudents}名
                  {trials.length > 0 && <span className="ml-1">（うち体験{trials.length}名）</span>}
                </div>
              </div>
            )
          })()}
          <DialogFooter>
            <Button onClick={() => setStudentDialogLessonId(null)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}