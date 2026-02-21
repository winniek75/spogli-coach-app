'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLessonSchedule } from '@/hooks/use-lesson-schedule'
import { useCoaches } from '@/hooks/use-coaches'
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
    rugby: '🏉',
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

  // レッスンスケジュールと講師データを取得
  const { lessons, addLesson, updateLesson, deleteLesson } = useLessonSchedule()
  const { coaches } = useCoaches()

  // レッスンフォームの状態
  const [formData, setFormData] = useState<LessonFormData>({
    date: selectedDate,
    startTime: '10:00',
    endTime: '11:00',
    school: 'ageo',
    classType: 'preschool',
    sport: 'volleyball',
    trainingType: 'coordination',
    maxStudents: 12,
    notes: '',
  })

  const [selectedCoaches, setSelectedCoaches] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTrainingTypeBadge = (type: string) => {
    const config = {
      vision: { label: tLessons('vision'), color: 'bg-blue-100 text-blue-800' },
      rhythm: { label: tLessons('rhythm'), color: 'bg-green-100 text-green-800' },
      coordination: { label: tLessons('coordination'), color: 'bg-purple-100 text-purple-800' },
    }
    const typeConfig = config[type as keyof typeof config] || config.coordination
    return (
      <Badge className={typeConfig.color}>
        {typeConfig.label}
      </Badge>
    )
  }

  // レッスン作成処理
  const handleCreateLesson = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await addLesson({
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

      // フォームをリセット
      setFormData({
        date: selectedDate,
        startTime: '10:00',
        endTime: '11:00',
        school: 'ageo',
        classType: 'preschool',
        sport: 'volleyball',
        trainingType: 'coordination',
        maxStudents: 12,
        notes: '',
      })
      setSelectedCoaches([])
      setIsAddDialogOpen(false)
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

  const filteredLessons = lessons.filter(lesson => {
    const matchesDate = lesson.date === selectedDate
    const matchesSchool = selectedSchool === 'all' || lesson.school === selectedSchool
    const matchesSport = selectedSport === 'all' || lesson.sport === selectedSport
    const matchesSearch =
      lesson.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.assignedCoaches.some(coach => coach.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lesson.lessonMenu?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesDate && matchesSchool && matchesSport && matchesSearch
  })

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
                      <SelectItem value="rugby">{tLessons('rugby')}</SelectItem>
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
                  <Select
                    value={formData.trainingType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, trainingType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coordination">{tLessons('coordination')}</SelectItem>
                      <SelectItem value="vision">{tLessons('vision')}</SelectItem>
                      <SelectItem value="rhythm">{tLessons('rhythm')}</SelectItem>
                      <SelectItem value="agility">アジリティ</SelectItem>
                      <SelectItem value="power">パワー</SelectItem>
                    </SelectContent>
                  </Select>
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
              <label className="text-sm font-medium mb-2 block">{tLessons('date')}</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
                  <SelectItem value="rugby">{tLessons('rugby')}</SelectItem>
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
          <CardTitle>{tLessons('lessonList')} - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
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
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {lesson.startTime} - {lesson.endTime}
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
                      <div className="flex items-center gap-1">
                        <span className={enrollmentStatus.color}>{enrollmentStatus.icon}</span>
                        <span className="font-medium">
                          {lesson.enrolledCount}/{lesson.maxStudents}
                        </span>
                        <span className={`text-xs ${enrollmentStatus.color}`}>
                          {enrollmentStatus.text}
                        </span>
                      </div>
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
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
    </div>
  )
}