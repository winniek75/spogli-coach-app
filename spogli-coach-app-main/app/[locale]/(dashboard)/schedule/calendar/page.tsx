'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLessonSchedule } from '@/hooks/use-lesson-schedule'
import { useCoaches } from '@/hooks/use-coaches'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 日本時間の日付をYYYY-MM-DD形式で取得
const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function CalendarPage() {
  const t = useTranslations('schedule.calendar')
  const { lessons, getLessonsByDate, loading } = useLessonSchedule()
  const { coaches } = useCoaches()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showLessonDialog, setShowLessonDialog] = useState(false)

  // 現在表示している月の年月を取得
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()

  // 選択した日のレッスンを取得
  const selectedDateStr = getLocalDateString(selectedDate)
  const selectedDayLessons = getLessonsByDate(selectedDateStr)

  // 今日のレッスンを取得
  const today = new Date()
  const todayStr = getLocalDateString(today)
  const todayLessons = getLessonsByDate(todayStr)

  // 今週のレッスンを取得
  const getThisWeekLessons = () => {
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date)
      return lessonDate >= startOfWeek && lessonDate <= endOfWeek
    })
  }

  const thisWeekLessons = getThisWeekLessons()

  // レッスンがある日付をマーカーとして表示するためのモディファイア
  const getLessonDaysModifiers = () => {
    const lessonDates = lessons.map(lesson => new Date(lesson.date))
    return {
      hasLesson: lessonDates,
    }
  }

  // カスタムDayButton - レッスンがある日に小さなドットを表示
  const CustomDayButton = ({ day, modifiers, ...props }: any) => {
    const hasLesson = modifiers.hasLesson
    const dayLessons = getLessonsByDate(getLocalDateString(day.date))

    return (
      <button
        {...props}
        className={cn(
          "relative h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          modifiers.today && "bg-accent text-accent-foreground",
          modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          modifiers.outside && "text-muted-foreground opacity-50",
          modifiers.disabled && "text-muted-foreground opacity-50",
          !modifiers.selected && !modifiers.outside && !modifiers.disabled && "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <time dateTime={getLocalDateString(day.date)}>
          {day.date.getDate()}
        </time>
        {dayLessons.length > 0 && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-0.5">
              {dayLessons.slice(0, 3).map((_, index) => (
                <div
                  key={index}
                  className="w-1 h-1 rounded-full bg-blue-500"
                />
              ))}
              {dayLessons.length > 3 && (
                <div className="w-1 h-1 rounded-full bg-gray-400" />
              )}
            </div>
          </div>
        )}
      </button>
    )
  }

  // 月間ナビゲーション
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">カレンダー</h1>
        <p className="text-muted-foreground mt-2">
          レッスンスケジュールをカレンダー形式で表示・管理します
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{lessons.length}</div>
            <p className="text-xs text-muted-foreground">総レッスン数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{todayLessons.length}</div>
            <p className="text-xs text-muted-foreground">今日のレッスン</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{thisWeekLessons.length}</div>
            <p className="text-xs text-muted-foreground">今週のレッスン</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {lessons.filter(l => !l.assignedCoaches || l.assignedCoaches.length === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">講師未定</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* カレンダー部分 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {selectedDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long'
                })}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  今月
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
              modifiers={getLessonDaysModifiers()}
              components={{
                DayButton: CustomDayButton,
              }}
              modifiersClassNames={{
                hasLesson: "font-semibold",
              }}
            />
          </CardContent>
        </Card>

        {/* 選択した日の詳細 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}のレッスン
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayLessons.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setShowLessonDialog(true)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {lesson.school === 'ageo' ? '上尾' : '桶川'}
                          </Badge>
                          <span className="text-sm font-medium">
                            {lesson.startTime} - {lesson.endTime}
                          </span>
                        </div>
                        {(!lesson.assignedCoaches || lesson.assignedCoaches.length === 0) && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="font-semibold mb-1">{lesson.sport}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {lesson.classType === 'preschool' ? '幼児' : '小学生'}クラス
                        <span className="ml-2">定員: {lesson.maxStudents}名</span>
                      </div>
                      {lesson.assignedCoaches && lesson.assignedCoaches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {lesson.assignedCoaches.map((coachName, index) => {
                            const coach = coaches.find(c => c.name === coachName)
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-1 text-xs"
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: '#666' }}
                                />
                                <span>{coachName}</span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">講師未定</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>この日はレッスンがありません</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 今日の予定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">今日の予定</CardTitle>
            </CardHeader>
            <CardContent>
              {todayLessons.length > 0 ? (
                <div className="space-y-2">
                  {todayLessons.map((lesson) => (
                    <div key={lesson.id} className="text-sm p-2 bg-blue-50 rounded">
                      <div className="font-medium">
                        {lesson.startTime} {lesson.sport}
                      </div>
                      <div className="text-xs text-gray-600">
                        {lesson.school === 'ageo' ? '上尾校' : '桶川校'} |
                        {lesson.classType === 'preschool' ? '幼児' : '小学生'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">今日はレッスンがありません</p>
              )}
            </CardContent>
          </Card>

          {/* 今週の予定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">今週の予定</CardTitle>
            </CardHeader>
            <CardContent>
              {thisWeekLessons.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {thisWeekLessons.slice(0, 5).map((lesson) => (
                    <div key={lesson.id} className="text-sm p-2 border rounded">
                      <div className="font-medium">
                        {new Date(lesson.date).toLocaleDateString('ja-JP', {
                          month: 'numeric', day: 'numeric', weekday: 'short'
                        })} {lesson.startTime}
                      </div>
                      <div className="text-xs text-gray-600">
                        {lesson.sport} ({lesson.school === 'ageo' ? '上尾' : '桶川'})
                      </div>
                    </div>
                  ))}
                  {thisWeekLessons.length > 5 && (
                    <div className="text-xs text-center text-gray-500 mt-2">
                      他{thisWeekLessons.length - 5}件のレッスン
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">今週はレッスンがありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 講師不足警告 */}
      {lessons.filter(l => !l.assignedCoaches || l.assignedCoaches.length === 0).length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>講師の割り当てが必要</AlertTitle>
          <AlertDescription>
            {lessons.filter(l => !l.assignedCoaches || l.assignedCoaches.length === 0).length}件のレッスンに講師が割り当てられていません。
            シフト管理ページで講師を割り当ててください。
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}