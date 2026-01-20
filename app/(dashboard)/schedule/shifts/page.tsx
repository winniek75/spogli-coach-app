'use client'

import { useState } from 'react'
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
} from '@/components/ui/dialog'
import {
  Calendar,
  Plus,
  Search,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// デモデータ
const demoShifts = [
  {
    id: '1',
    coachId: 'coach-1',
    coachName: 'Risa',
    date: '2025-01-20',
    startTime: '09:00',
    endTime: '17:00',
    school: 'ageo',
    status: 'confirmed',
    notes: null,
  },
  {
    id: '2',
    coachId: 'coach-1',
    coachName: 'Risa',
    date: '2025-01-21',
    startTime: '09:00',
    endTime: '17:00',
    school: 'okegawa',
    status: 'scheduled',
    notes: null,
  },
  {
    id: '3',
    coachId: 'coach-2',
    coachName: 'Aung',
    date: '2025-01-20',
    startTime: '10:00',
    endTime: '18:00',
    school: 'ageo',
    status: 'confirmed',
    notes: '延長対応可能',
  },
]

const demoCoaches = [
  { id: 'coach-1', name: 'Risa' },
  { id: 'coach-2', name: 'Aung' },
  { id: 'coach-3', name: 'Gecko' },
]

export default function ShiftsPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedSchool, setSelectedSchool] = useState('all')
  const [selectedCoach, setSelectedCoach] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = getWeekDates(currentWeek)

  const filteredShifts = demoShifts.filter(shift => {
    const matchesSchool = selectedSchool === 'all' || shift.school === selectedSchool
    const matchesCoach = selectedCoach === 'all' || shift.coachId === selectedCoach
    const matchesSearch = shift.coachName.toLowerCase().includes(searchTerm.toLowerCase())

    // 今週の範囲内かチェック
    const shiftDate = new Date(shift.date)
    const isInCurrentWeek = weekDates.some(date =>
      date.toDateString() === shiftDate.toDateString()
    )

    return matchesSchool && matchesCoach && matchesSearch && isInCurrentWeek
  })

  const getSchoolBadge = (school: string) => {
    return (
      <Badge variant="outline" className="text-xs">
        {school === 'ageo' ? '上尾校' : '桶川校'}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: '予定', color: 'bg-blue-100 text-blue-800' },
      confirmed: { label: '確定', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newDate)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">シフト管理</h1>
          <p className="text-muted-foreground mt-2">
            講師のシフトスケジュールを管理します
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            印刷
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                シフト追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいシフトを追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  シフト追加機能は開発中です
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 週間ナビゲーションと統計 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              週間表示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {weekDates[0].getFullYear()}年{weekDates[0].getMonth() + 1}月{weekDates[0].getDate()}日 〜 {weekDates[6].getDate()}日
              </span>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                <div key={day} className="p-2 text-sm font-medium">
                  {day}
                </div>
              ))}
              {weekDates.map((date, i) => (
                <div key={i} className="p-2 text-sm">
                  {date.getDate()}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今週の統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredShifts.length}</div>
                <div className="text-xs text-muted-foreground">総シフト数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredShifts.filter(s => s.status === 'confirmed').length}
                </div>
                <div className="text-xs text-muted-foreground">確定済み</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(filteredShifts.map(s => s.coachId)).size}
                </div>
                <div className="text-xs text-muted-foreground">勤務講師数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="講師名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger>
                <SelectValue placeholder="校舎で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全校舎</SelectItem>
                <SelectItem value="ageo">上尾校</SelectItem>
                <SelectItem value="okegawa">桶川校</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCoach} onValueChange={setSelectedCoach}>
              <SelectTrigger>
                <SelectValue placeholder="講師で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全講師</SelectItem>
                {demoCoaches.map(coach => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredShifts.length}件のシフト
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* シフト一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>シフト一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>講師</TableHead>
                <TableHead>時間</TableHead>
                <TableHead>校舎</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>備考</TableHead>
                <TableHead className="w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    {new Date(shift.date).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{shift.coachName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {shift.startTime} - {shift.endTime}
                    </div>
                  </TableCell>
                  <TableCell>{getSchoolBadge(shift.school)}</TableCell>
                  <TableCell>{getStatusBadge(shift.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {shift.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredShifts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>該当するシフトがありません</p>
              <p className="text-sm mt-2">フィルター条件を変更してください</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}