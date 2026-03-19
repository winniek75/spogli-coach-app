'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useCoaches } from '@/hooks/use-coaches'
import { useLessonSchedule } from '@/hooks/use-lesson-schedule'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calendar,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  Edit,
  Trash2,
  CalendarDays,
  Settings,
  Save,
  X,
} from 'lucide-react'

// 型定義
interface Coach {
  id: string
  name: string
  color: string
  isActive: boolean
  specialties: string[]
}

interface Shift {
  id: string
  coachId: string
  subCoachIds?: string[]  // サブコーチのIDリスト（最大2名）
  date: string
  startTime: string
  endTime: string
  location: string
  classType: string
  role: 'main' | 'sub' | 'support'
  status: 'confirmed' | 'tentative' | 'cancelled'
  notes?: string
}

interface TimeSlot {
  start: string
  end: string
  label: string
  classType?: string
}

export default function ImprovedShiftTablePage() {
  // Hooks
  const { coaches: realCoaches, loading: coachesLoading } = useCoaches()
  const { lessons, loading: lessonsLoading } = useLessonSchedule()

  // State管理
  const [shifts, setShifts] = useState<Shift[]>([])
  const [viewMode, setViewMode] = useState<'personal' | 'admin'>('admin')
  const [displayMode, setDisplayMode] = useState<'week' | 'month'>('week')
  const [selectedCoach, setSelectedCoach] = useState<string | 'all'>('all')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSchool, setSelectedSchool] = useState<string>('all')
  const [showShiftDialog, setShowShiftDialog] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [showTimeSlotEditor, setShowTimeSlotEditor] = useState(false)
  const [editableTimeSlots, setEditableTimeSlots] = useState<TimeSlot[]>([])
  const [selectedCell, setSelectedCell] = useState<{date: string, timeSlot: string, school: string} | null>(null)
  const [newShift, setNewShift] = useState<{
    coachId: string
    subCoachIds: string[]
    date: string
    timeSlot: string
    school: string
    hasLesson: boolean
    notes: string
  }>({
    coachId: '',
    subCoachIds: [],
    date: '',
    timeSlot: '',
    school: '',
    hasLesson: false,
    notes: ''
  })

  // コーチの色を一意に割り当て
  const getCoachColorFromIndex = (index: number) => {
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']
    return colors[index % colors.length]
  }

  // 実際のコーチデータをシフト用に変換（useMemoで最適化）
  const coaches = useMemo(() => {
    return realCoaches.map((coach, index) => ({
      id: coach.id,
      name: coach.name,
      color: getCoachColorFromIndex(index),
      isActive: coach.status === 'active',
      specialties: coach.schools
    }))
  }, [realCoaches])

  // デフォルトの時間割（1時間区切り）
  const defaultTimeSlots: TimeSlot[] = [
    { start: '09:00', end: '10:00', label: '9:00-10:00', classType: '幼児クラス' },
    { start: '10:00', end: '11:00', label: '10:00-11:00', classType: '幼児クラス' },
    { start: '11:00', end: '12:00', label: '11:00-12:00', classType: '幼児クラス' },
    { start: '13:00', end: '14:00', label: '13:00-14:00', classType: '小学生クラス' },
    { start: '14:00', end: '15:00', label: '14:00-15:00', classType: '小学生クラス' },
    { start: '15:00', end: '16:00', label: '15:00-16:00', classType: '小学生クラス' },
  ]

  // localStorage から時間割を読み込み
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(defaultTimeSlots)

  useEffect(() => {
    const saved = localStorage.getItem('shiftTimeSlots')
    if (saved) {
      setTimeSlots(JSON.parse(saved))
    }
  }, [])

  // 時間割を保存
  const saveTimeSlots = (slots: TimeSlot[]) => {
    const sorted = [...slots].sort((a, b) => a.start.localeCompare(b.start))
    setTimeSlots(sorted)
    localStorage.setItem('shiftTimeSlots', JSON.stringify(sorted))
    setShowTimeSlotEditor(false)
  }

  // 時間割編集の開始
  const startEditTimeSlots = () => {
    setEditableTimeSlots([...timeSlots])
    setShowTimeSlotEditor(true)
  }

  // 編集中の時間割を更新
  const updateEditableSlot = (index: number, field: keyof TimeSlot, value: string) => {
    setEditableTimeSlots(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      if (field === 'start' || field === 'end') {
        updated[index].label = `${updated[index].start}-${updated[index].end}`
      }
      return updated
    })
  }

  // 時間割を追加
  const addEditableSlot = () => {
    setEditableTimeSlots(prev => [
      ...prev,
      { start: '16:00', end: '17:00', label: '16:00-17:00', classType: '' }
    ])
  }

  // 時間割を削除
  const removeEditableSlot = (index: number) => {
    setEditableTimeSlots(prev => prev.filter((_, i) => i !== index))
  }

  // 特定の日時・時間帯・校舎にレッスンがあるかチェック
  const hasLesson = useCallback((date: string, timeSlot: TimeSlot, school: string) => {
    if (!lessons) return false

    return lessons.some(lesson =>
      lesson.date === date &&
      lesson.startTime === timeSlot.start &&
      lesson.endTime === timeSlot.end &&
      lesson.school === school
    )
  }, [lessons])

  // レッスンが必要な時間帯を取得
  const getLesson = useCallback((date: string, timeSlot: TimeSlot, school: string) => {
    if (!lessons) return null

    return lessons.find(lesson =>
      lesson.date === date &&
      lesson.startTime === timeSlot.start &&
      lesson.endTime === timeSlot.end &&
      lesson.school === school
    ) || null
  }, [lessons])

  // デモシフトデータ生成（表形式用）
  const generateDemoShifts = useCallback(() => {
    const demoShifts: Shift[] = []
    const today = new Date()

    // 今後4週間の土日にシフトを生成
    for (let week = 0; week < 4; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(today)
        date.setDate(today.getDate() - today.getDay() + day + (week * 7))

        // 土日のみシフトを作成
        if (date.getDay() === 6 || date.getDay() === 0) {
          const schools = ['ageo', 'okegawa']

          schools.forEach(school => {
            timeSlots.forEach((timeSlot, index) => {
              // ランダムにシフトを配置（70%の確率）
              if (Math.random() > 0.3 && coaches.length > 0) {
                const coachIndex = Math.floor(Math.random() * coaches.length)
                const coach = coaches[coachIndex]

                demoShifts.push({
                  id: `shift-${week}-${day}-${school}-${index}`,
                  coachId: coach.id,
                  subCoachIds: Math.random() > 0.7 ? [coaches[(coachIndex + 1) % coaches.length].id] : [],
                  date: date.toISOString().split('T')[0],
                  startTime: timeSlot.start,
                  endTime: timeSlot.end,
                  location: school === 'ageo' ? '上尾校' : '桶川校',
                  classType: timeSlot.classType || '一般',
                  role: 'main',
                  status: 'confirmed'
                })
              }
            })
          })
        }
      }
    }

    setShifts(demoShifts)
    localStorage.setItem('tableShifts', JSON.stringify(demoShifts))
  }, [coaches, timeSlots])

  // 初期データの読み込み
  useEffect(() => {
    // シフトデータの読み込み
    const savedShifts = localStorage.getItem('tableShifts')
    if (savedShifts) {
      setShifts(JSON.parse(savedShifts))
    } else if (coaches.length > 0 && timeSlots.length > 0) {
      generateDemoShifts()
    }
  }, [coaches.length, timeSlots.length, generateDemoShifts])

  // デモシフトデータの初期化
  useEffect(() => {
    if (coaches.length > 0 && shifts.length === 0) {
      const demoShifts: Shift[] = [
        {
          id: 'demo-1',
          coachId: coaches[0]?.id || 'coach-1',
          subCoachIds: coaches.length > 2 ? [coaches[1]?.id, coaches[2]?.id] : [],
          date: '2025-02-08',
          startTime: '10:10',
          endTime: '11:00',
          location: 'ageo',
          classType: 'lesson',
          role: 'main',
          status: 'confirmed',
          notes: 'サッカー基礎練習'
        },
        {
          id: 'demo-2',
          coachId: coaches[1]?.id || 'coach-2',
          subCoachIds: coaches.length > 3 ? [coaches[3]?.id] : [],
          date: '2025-02-09',
          startTime: '11:30',
          endTime: '12:30',
          location: 'okegawa',
          classType: 'lesson',
          role: 'main',
          status: 'confirmed',
          notes: 'ダンスレッスン'
        }
      ]
      setShifts(demoShifts)
    }
  }, [coaches])

  // サブコーチを追加
  const addSubCoach = (coachId: string) => {
    if (newShift.subCoachIds.length < 2 && !newShift.subCoachIds.includes(coachId) && coachId !== newShift.coachId) {
      setNewShift(prev => ({
        ...prev,
        subCoachIds: [...prev.subCoachIds, coachId]
      }))
    }
  }

  // サブコーチを削除
  const removeSubCoach = (coachId: string) => {
    setNewShift(prev => ({
      ...prev,
      subCoachIds: prev.subCoachIds.filter(id => id !== coachId)
    }))
  }

  // 週の開始日を取得
  const getWeekStart = (date: Date) => {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    return start
  }

  // 現在の週の土日のみを取得
  const getCurrentWeekWeekends = () => {
    const weekStart = getWeekStart(selectedDate)
    const weekends = []

    // 土曜日
    const saturday = new Date(weekStart)
    saturday.setDate(weekStart.getDate() + 6)
    weekends.push(saturday)

    // 日曜日
    const sunday = new Date(weekStart)
    sunday.setDate(weekStart.getDate() + 7)
    weekends.push(sunday)

    return weekends
  }

  // 現在の月の土日のみを取得
  const getCurrentMonthWeekends = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const weekends = []

    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // 月の全ての日をチェックして土日のみ抽出
    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      if (date.getDay() === 0 || date.getDay() === 6) { // 日曜日または土曜日
        weekends.push(new Date(date))
      }
    }

    return weekends
  }

  // 特定の日時・校舎のシフトを取得
  const getShiftForSlot = (date: Date, timeSlot: TimeSlot, school: string) => {
    const dateString = date.toISOString().split('T')[0]
    const schoolName = school === 'ageo' ? '上尾校' : '桶川校'

    let shift = shifts.find(s =>
      s.date === dateString &&
      s.startTime === timeSlot.start &&
      s.location === schoolName
    )

    // 個人ビューの場合、選択された講師のみ表示
    if (viewMode === 'personal' && selectedCoach !== 'all' && shift) {
      if (shift.coachId !== selectedCoach) {
        return null
      }
    }

    return shift
  }

  // 講師名を取得
  const getCoachName = (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId)
    return coach?.name || '不明'
  }

  // 講師色を取得
  const getCoachColor = (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId)
    return coach?.color || '#gray'
  }

  // 週移動
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7))
    setSelectedDate(newDate)
  }

  // 月移動
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'next') {
      newDate.setMonth(selectedDate.getMonth() + 1)
    } else {
      newDate.setMonth(selectedDate.getMonth() - 1)
    }
    setSelectedDate(newDate)
  }

  // セル クリックハンドラ
  const handleCellClick = (date: Date, timeSlot: TimeSlot, school: string) => {
    const existingShift = getShiftForSlot(date, timeSlot, school)

    if (existingShift) {
      setEditingShift(existingShift)
    } else {
      setSelectedCell({
        date: date.toISOString().split('T')[0],
        timeSlot: `${timeSlot.start}-${timeSlot.end}`,
        school
      })
      setNewShift({
        coachId: '',
        subCoachIds: [],
        date: date.toISOString().split('T')[0],
        timeSlot: `${timeSlot.start}-${timeSlot.end}`,
        school,
        hasLesson: hasLesson(date.toISOString().split('T')[0], timeSlot, school),
        notes: ''
      })
    }
    setShowShiftDialog(true)
  }

  // シフト削除
  const deleteShift = (shiftId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedShifts = shifts.filter(s => s.id !== shiftId)
    setShifts(updatedShifts)
    localStorage.setItem('tableShifts', JSON.stringify(updatedShifts))
  }

  // シフト作成
  const createShift = () => {
    if (!newShift.coachId) {
      alert('メインコーチを選択してください')
      return
    }

    const newId = Date.now().toString()
    const shift: Shift = {
      id: newId,
      coachId: newShift.coachId,
      subCoachIds: newShift.subCoachIds,
      date: newShift.date,
      startTime: newShift.timeSlot.split('-')[0],
      endTime: newShift.timeSlot.split('-')[1],
      location: newShift.school === 'ageo' ? '上尾校' : '桶川校',
      classType: newShift.hasLesson ? 'lesson' : 'other',
      role: 'main',
      status: 'confirmed',
      notes: newShift.notes
    }

    setShifts(prev => [...prev, shift])
    localStorage.setItem('tableShifts', JSON.stringify([...shifts, shift]))
    setShowShiftDialog(false)
    setSelectedCell(null)
    setNewShift({
      coachId: '',
      subCoachIds: [],
      date: '',
      timeSlot: '',
      school: '',
      hasLesson: false,
      notes: ''
    })
  }

  const weekends = displayMode === 'week' ? getCurrentWeekWeekends() : getCurrentMonthWeekends()
  const schools = selectedSchool === 'all' ? ['ageo', 'okegawa'] : [selectedSchool]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">シフト管理</h1>
          <p className="text-muted-foreground">
            講師のシフトスケジュールを管理します。
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-50 border-l-4 border-l-blue-500 rounded-sm"></div>
              <span className="text-muted-foreground">レッスンスケジュールあり</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-600">📚</span>
              <span className="text-muted-foreground">講師アサイン待ち</span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={startEditTimeSlots}>
          <Settings className="h-4 w-4 mr-2" />
          時間割設定
        </Button>
      </div>

      {/* コントロールパネル */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* ビューモード切り替え */}
            <div className="flex items-center gap-4">
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="admin" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    管理者ビュー
                  </TabsTrigger>
                  <TabsTrigger value="personal" className="gap-2">
                    <UserCheck className="h-4 w-4" />
                    個人ビュー
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* 表示期間切り替え */}
              <Tabs value={displayMode} onValueChange={(value: any) => setDisplayMode(value)}>
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="week" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    週表示
                  </TabsTrigger>
                  <TabsTrigger value="month" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    月表示
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 講師選択（個人ビュー時のみ） */}
            {viewMode === 'personal' && (
              <div className="flex items-center gap-2">
                <Label>講師:</Label>
                <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.filter(c => c.isActive).map(coach => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 校舎選択 */}
            <div className="flex items-center gap-2">
              <Label>校舎:</Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全校舎</SelectItem>
                  <SelectItem value="ageo">上尾校</SelectItem>
                  <SelectItem value="okegawa">桶川校</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ナビゲーション */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => displayMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-28 text-center">
                {displayMode === 'week'
                  ? `${getWeekStart(selectedDate).getMonth() + 1}月 第${Math.ceil(getWeekStart(selectedDate).getDate() / 7)}週`
                  : `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`
                }
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => displayMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 表形式シフト表示 */}
      {schools.map(school => (
        <Card key={school}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {school === 'ageo' ? '上尾校' : '桶川校'}
              {selectedSchool === 'all' && school === 'okegawa' && (
                <span className="text-sm text-muted-foreground">（幼児クラスのみ）</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-32 font-semibold">時間</TableHead>
                    {weekends.map((date, index) => (
                      <TableHead
                        key={index}
                        className={`text-center font-semibold ${
                          displayMode === 'month' ? 'min-w-20 px-1' : 'min-w-32'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className={`${displayMode === 'month' ? 'text-xs' : 'text-sm'}`}>
                            {date.getDay() === 6 ? '土' : '日'}
                          </span>
                          <span className={`font-bold ${
                            displayMode === 'month' ? 'text-sm' : 'text-lg'
                          }`}>
                            {displayMode === 'month'
                              ? `${date.getDate()}`
                              : `${date.getMonth() + 1}/${date.getDate()}`
                            }
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <TableRow key={timeIndex}>
                      <TableCell className="font-medium bg-muted/20">
                        <div className="text-sm">
                          <div>{timeSlot.label}</div>
                          <select
                            className="text-xs text-muted-foreground mt-1 bg-transparent border-none cursor-pointer hover:text-foreground focus:outline-none w-full"
                            value={timeSlot.classType || ''}
                            onChange={(e) => {
                              const updated = timeSlots.map((ts, i) =>
                                i === timeIndex ? { ...ts, classType: e.target.value } : ts
                              )
                              setTimeSlots(updated)
                              localStorage.setItem('shiftTimeSlots', JSON.stringify(updated))
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">クラス未設定</option>
                            <option value="幼児クラス">幼児クラス</option>
                            <option value="小学生クラス">小学生クラス</option>
                            <option value="合同クラス">合同クラス</option>
                          </select>
                        </div>
                      </TableCell>
                      {weekends.map((date, dateIndex) => {
                        const shift = getShiftForSlot(date, timeSlot, school)
                        const lesson = getLesson(date.toISOString().split('T')[0], timeSlot, school)
                        const hasLessonScheduled = hasLesson(date.toISOString().split('T')[0], timeSlot, school)

                        return (
                          <TableCell
                            key={dateIndex}
                            className={`cursor-pointer hover:bg-muted/50 transition-colors relative ${
                              displayMode === 'month' ? 'p-0.5' : 'p-1'
                            } ${hasLessonScheduled ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            onClick={() => handleCellClick(date, timeSlot, school)}
                          >
                            {shift ? (
                              <div
                                className={`rounded text-white font-medium relative group flex flex-col items-center justify-center ${
                                  displayMode === 'month'
                                    ? 'px-1 py-0.5 text-xs min-h-6'
                                    : 'px-2 py-1 text-xs min-h-8'
                                }`}
                                style={{ backgroundColor: getCoachColor(shift.coachId) }}
                              >
                                <div className="text-center w-full">
                                  {/* メインコーチ */}
                                  <div className={`font-bold ${displayMode === 'month' ? 'text-xs' : 'text-sm'}`}>
                                    {getCoachName(shift.coachId)}
                                  </div>

                                  {/* サブコーチ表示 */}
                                  {shift.subCoachIds && shift.subCoachIds.length > 0 && (
                                    <div className={`${displayMode === 'month' ? 'text-xs' : 'text-xs'} opacity-90 space-y-0.5`}>
                                      {shift.subCoachIds.map((subCoachId, index) => (
                                        <div key={index} className="flex items-center justify-center gap-1">
                                          <span className="text-xs">+</span>
                                          <span>{getCoachName(subCoachId)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* ノート表示 */}
                                  {shift.notes && displayMode === 'week' && (
                                    <div className="text-xs opacity-90 mt-1">
                                      {shift.notes}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => deleteShift(shift.id, e)}
                                  className={`absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full flex items-center justify-center text-xs ${
                                    displayMode === 'month' ? 'w-3 h-3' : 'w-4 h-4'
                                  }`}
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className={`flex flex-col items-center justify-center text-muted-foreground text-xs hover:bg-blue-50 rounded transition-colors ${
                                displayMode === 'month' ? 'min-h-6' : 'min-h-8'
                              }`}>
                                {hasLessonScheduled && lesson ? (
                                  <div className="flex flex-col items-center text-center space-y-0.5">
                                    <div className={`text-blue-600 font-medium ${displayMode === 'month' ? 'text-xs' : 'text-xs'}`}>
                                      📚 レッスン
                                    </div>
                                    <div className={`text-blue-500 ${displayMode === 'month' ? 'text-xs' : 'text-xs'}`}>
                                      {lesson.sport}
                                    </div>
                                    <div className="text-orange-500 font-semibold text-xs">
                                      講師必要
                                    </div>
                                  </div>
                                ) : (
                                  '+'
                                )}
                              </div>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* シフト作成/編集ダイアログ */}
      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>シフト作成</DialogTitle>
            <DialogDescription>
              {selectedCell && `${selectedCell.date} ${selectedCell.timeSlot} ${selectedCell.school === 'ageo' ? '上尾校' : '桶川校'}`}
              {newShift.hasLesson && (
                <div className="mt-1 text-blue-600 font-medium">📚 レッスン予定あり</div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* メインコーチ選択 */}
            <div>
              <Label>メインコーチ *</Label>
              <Select
                value={newShift.coachId}
                onValueChange={(value) => setNewShift(prev => ({ ...prev, coachId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="メインコーチを選択" />
                </SelectTrigger>
                <SelectContent>
                  {coaches.filter(coach => coach.isActive).map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: coach.color }}
                        />
                        {coach.name}
                        {coach.specialties && coach.specialties.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({coach.specialties.join(', ')})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* サブコーチ選択 */}
            <div>
              <Label>サブコーチ（最大2名）</Label>
              <div className="space-y-2">
                {/* 選択されたサブコーチ表示 */}
                {newShift.subCoachIds.map((subCoachId, index) => {
                  const coach = coaches.find(c => c.id === subCoachId)
                  return (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: coach?.color }}
                        />
                        <span>{coach?.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubCoach(subCoachId)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  )
                })}

                {/* サブコーチ追加セレクト */}
                {newShift.subCoachIds.length < 2 && (
                  <Select onValueChange={addSubCoach}>
                    <SelectTrigger>
                      <SelectValue placeholder="サブコーチを追加" />
                    </SelectTrigger>
                    <SelectContent>
                      {coaches
                        .filter(coach =>
                          coach.isActive &&
                          coach.id !== newShift.coachId &&
                          !newShift.subCoachIds.includes(coach.id)
                        )
                        .map(coach => (
                          <SelectItem key={coach.id} value={coach.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: coach.color }}
                              />
                              {coach.name}
                              {coach.specialties && coach.specialties.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({coach.specialties.join(', ')})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* メモ */}
            <div>
              <Label>メモ</Label>
              <Input
                value={newShift.notes}
                onChange={(e) => setNewShift(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="備考があれば入力..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShiftDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={createShift}>
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 時間割設定ダイアログ */}
      <Dialog open={showTimeSlotEditor} onOpenChange={setShowTimeSlotEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              時間割設定
            </DialogTitle>
            <DialogDescription>
              シフト表の時間帯とクラスを編集できます。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {editableTimeSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateEditableSlot(index, 'start', e.target.value)}
                    className="w-28 text-sm"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateEditableSlot(index, 'end', e.target.value)}
                    className="w-28 text-sm"
                  />
                </div>
                <select
                  value={slot.classType || ''}
                  onChange={(e) => updateEditableSlot(index, 'classType', e.target.value)}
                  className="text-sm border rounded px-2 py-1.5 bg-background"
                >
                  <option value="">未設定</option>
                  <option value="幼児クラス">幼児クラス</option>
                  <option value="小学生クラス">小学生クラス</option>
                  <option value="合同クラス">合同クラス</option>
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => removeEditableSlot(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={addEditableSlot}>
            + 時間帯を追加
          </Button>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeSlotEditor(false)}>
              キャンセル
            </Button>
            <Button onClick={() => saveTimeSlots(editableTimeSlots)}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}