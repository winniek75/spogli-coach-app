'use client'

import { useState } from 'react'
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

export default function SchedulePage() {
  const [currentDate] = useState(new Date())

  // サンプルデータ
  const upcomingShifts = [
    {
      id: '1',
      date: '2025-01-18',
      time: '9:00 - 17:00',
      school: '上尾校',
      coach: 'Risa',
      status: 'confirmed',
    },
    {
      id: '2',
      date: '2025-01-18',
      time: '10:00 - 18:00',
      school: '桶川校',
      coach: 'Aung',
      status: 'scheduled',
    },
    {
      id: '3',
      date: '2025-01-19',
      time: '13:00 - 21:00',
      school: '上尾校',
      coach: 'Gecko',
      status: 'scheduled',
    },
  ]

  const upcomingLessons = [
    {
      id: '1',
      date: '2025-01-18',
      time: '10:10 - 11:00',
      school: '上尾校',
      classType: '未就学児',
      sport: 'バレーボール',
      coaches: ['Risa', 'Aung'],
      enrolled: 8,
      max: 12,
    },
    {
      id: '2',
      date: '2025-01-18',
      time: '14:10 - 15:00',
      school: '桶川校',
      classType: '未就学児',
      sport: 'バレーボール',
      coaches: ['Gecko'],
      enrolled: 10,
      max: 12,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600">確定</Badge>
      case 'scheduled':
        return <Badge variant="secondary">予定</Badge>
      case 'cancelled':
        return <Badge variant="destructive">キャンセル</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">スケジュール管理</h1>
          <p className="text-muted-foreground mt-2">
            講師のシフトとレッスン日程を管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            設定
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日のシフト</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3名</div>
            <p className="text-xs text-muted-foreground">
              上尾校: 2名 / 桶川校: 1名
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日のレッスン</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4回</div>
            <p className="text-xs text-muted-foreground">
              バレーボール中心
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総受講生</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18名</div>
            <p className="text-xs text-muted-foreground">
              定員: 24名
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">講師稼働率</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              今週平均
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
            {upcomingShifts.map((shift) => (
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
            ))}
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
            {upcomingLessons.map((lesson) => (
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
                    <p className="text-muted-foreground">講師: {lesson.coaches.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{lesson.enrolled}/{lesson.max}名</p>
                    <p className="text-xs text-muted-foreground">受講予定</p>
                  </div>
                </div>
              </div>
            ))}
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