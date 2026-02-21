'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Users,
  Plus,
  CalendarDays,
  BookOpen,
  Settings,
} from 'lucide-react'
import { useLessonSchedule } from '@/hooks/use-lesson-schedule'
import { useCoaches } from '@/hooks/use-coaches'

export default function SchedulePage() {
  const [currentDate] = useState(new Date())
  const tSchedule = useTranslations('schedule')
  const tCommon = useTranslations('common')
  const { lessons, loading: lessonsLoading } = useLessonSchedule()
  const { coaches, loading: coachesLoading } = useCoaches()
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([])
  const [todayStats, setTodayStats] = useState({
    coachesCount: 0,
    lessonsCount: 0,
    studentsCount: 0,
    maxStudents: 0,
    utilization: 0,
  })

  useEffect(() => {
    // 今日のレッスンを取得
    const today = new Date().toISOString().split('T')[0]
    const todayLessons = lessons.filter(lesson => lesson.date === today)
    const nextLessons = lessons
      .filter(lesson => lesson.date >= today)
      .slice(0, 2)
      .map(lesson => ({
        id: lesson.id,
        date: lesson.date,
        time: `${lesson.startTime} - ${lesson.endTime}`,
        school: lesson.school === 'ageo' ? '上尾校' : '桶川校',
        classType: lesson.classType === 'preschool' ? '未就学児' : '小学生',
        sport: lesson.sport === 'volleyball' ? 'バレーボール' : lesson.sport,
        coaches: lesson.assignedCoaches || [],
        enrolled: lesson.enrolledCount || 0,
        max: lesson.maxStudents,
      }))

    // シフト情報（レッスンから生成）
    const nextShifts = lessons
      .filter(lesson => lesson.date >= today && lesson.assignedCoaches.length > 0)
      .slice(0, 3)
      .flatMap(lesson =>
        lesson.assignedCoaches.map((coach, index) => ({
          id: `${lesson.id}-${index}`,
          date: lesson.date,
          time: `${lesson.startTime} - ${lesson.endTime}`,
          school: lesson.school === 'ageo' ? '上尾校' : '桶川校',
          coach: coach,
          status: lesson.status === 'scheduled' ? 'scheduled' : 'confirmed',
        }))
      )

    // 統計情報を計算
    const todayCoaches = new Set(
      todayLessons.flatMap(lesson => lesson.assignedCoaches)
    ).size
    const todayStudents = todayLessons.reduce(
      (sum, lesson) => sum + (lesson.enrolledCount || 0),
      0
    )
    const todayMaxStudents = todayLessons.reduce(
      (sum, lesson) => sum + lesson.maxStudents,
      0
    )

    setUpcomingShifts(nextShifts.slice(0, 3))
    setUpcomingLessons(nextLessons)
    setTodayStats({
      coachesCount: todayCoaches,
      lessonsCount: todayLessons.length,
      studentsCount: todayStudents,
      maxStudents: todayMaxStudents,
      utilization: todayMaxStudents > 0 ? Math.round((todayStudents / todayMaxStudents) * 100) : 0,
    })
  }, [lessons])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600">{tSchedule('confirmed')}</Badge>
      case 'scheduled':
        return <Badge variant="secondary">{tSchedule('scheduled')}</Badge>
      case 'cancelled':
        return <Badge variant="destructive">{tSchedule('cancelled')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tSchedule('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {tSchedule('subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            {tSchedule('settings')}
          </Button>
          <Link href="/schedule/lessons/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {tSchedule('newSchedule')}
            </Button>
          </Link>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tSchedule('todayShifts')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.coachesCount}{tSchedule('coaches')}</div>
            <p className="text-xs text-muted-foreground">
              {coaches.filter(c => c.status === 'active').length}名中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tSchedule('todayLessons')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.lessonsCount}回</div>
            <p className="text-xs text-muted-foreground">
              予定済み
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tSchedule('totalStudents')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.studentsCount}名</div>
            <p className="text-xs text-muted-foreground">
              定員: {todayStats.maxStudents}名
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tSchedule('coachUtilization')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.utilization}%</div>
            <p className="text-xs text-muted-foreground">
              今日の稼働率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* クイックアクション */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/schedule/shifts">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                シフト管理
              </CardTitle>
              <CardDescription>
                講師のシフト登録・編集・確認
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                シフト表を見る
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/schedule/lessons">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                レッスン日程
              </CardTitle>
              <CardDescription>
                レッスンスケジュールの作成・管理
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                日程を確認
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/schedule/calendar">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                カレンダー
              </CardTitle>
              <CardDescription>
                月間カレンダーでスケジュール確認
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                カレンダー表示
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 今後のシフト */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                今後のシフト
              </CardTitle>
              <Link href="/schedule/shifts">
                <Button size="sm" variant="outline">
                  すべて見る
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingShifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>シフトが登録されていません</p>
                <Link href="/schedule/shifts/new">
                  <Button size="sm" variant="outline" className="mt-2">
                    シフトを登録
                  </Button>
                </Link>
              </div>
            ) : (
              upcomingShifts.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{shift.date}</Badge>
                      <span className="font-medium">{shift.coach}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{shift.time}</span>
                      <span>{shift.school}</span>
                    </div>
                  </div>
                  {getStatusBadge(shift.status)}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 今後のレッスン */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                今後のレッスン
              </CardTitle>
              <Link href="/schedule/lessons">
                <Button size="sm" variant="outline">
                  すべて見る
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingLessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>レッスンが登録されていません</p>
                <Link href="/schedule/lessons/new">
                  <Button size="sm" variant="outline" className="mt-2">
                    レッスンを登録
                  </Button>
                </Link>
              </div>
            ) : (
              upcomingLessons.map((lesson) => (
                <div key={lesson.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{lesson.date}</Badge>
                      <span className="font-medium">{lesson.sport}</span>
                    </div>
                    <Badge variant="secondary">{lesson.school}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">{lesson.time} / {lesson.classType}</p>
                      <p className="text-muted-foreground">講師: {lesson.coaches.length > 0 ? lesson.coaches.join(', ') : '未定'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{lesson.enrolled}/{lesson.max}名</p>
                      <p className="text-xs text-muted-foreground">受講予定</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 開発中の機能 */}
      <Card>
        <CardHeader>
          <CardTitle>開発状況</CardTitle>
          <CardDescription>Phase 2: 講師・スケジュール管理の進捗</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              <span className="text-sm">講師CRUD機能</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-amber-600 rounded-full"></div>
              <span className="text-sm">シフト管理 (開発中)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm">資格管理 (予定)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm">自動アサイン (予定)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}