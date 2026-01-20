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
  Users,
  Trophy,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  AlertCircle,
} from 'lucide-react'

// デモデータ
const demoLessons = [
  {
    id: '1',
    date: '2025-01-20',
    startTime: '10:00',
    endTime: '11:00',
    school: 'ageo',
    classType: 'preschool',
    sport: 'volleyball',
    trainingType: 'coordination',
    assignedCoaches: ['Risa', 'Aung'],
    maxStudents: 12,
    enrolledCount: 10,
    status: 'scheduled',
    lessonMenu: 'バレーボール基礎練習',
  },
  {
    id: '2',
    date: '2025-01-20',
    startTime: '14:00',
    endTime: '15:00',
    school: 'okegawa',
    classType: 'elementary',
    sport: 'basketball',
    trainingType: 'vision',
    assignedCoaches: ['Gecko'],
    maxStudents: 15,
    enrolledCount: 15,
    status: 'confirmed',
    lessonMenu: 'バスケットボール応用練習',
  },
  {
    id: '3',
    date: '2025-01-21',
    startTime: '15:30',
    endTime: '16:30',
    school: 'ageo',
    classType: 'preschool',
    sport: 'soccer',
    trainingType: 'rhythm',
    assignedCoaches: ['Risa'],
    maxStudents: 12,
    enrolledCount: 8,
    status: 'in_progress',
    lessonMenu: null,
  },
]

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

const getTrainingTypeBadge = (type: string) => {
  const config = {
    vision: { label: 'ビジョン', color: 'bg-blue-100 text-blue-800' },
    rhythm: { label: 'リズム', color: 'bg-green-100 text-green-800' },
    coordination: { label: 'コーディネーション', color: 'bg-purple-100 text-purple-800' },
  }
  const typeConfig = config[type as keyof typeof config] || config.coordination
  return (
    <Badge className={typeConfig.color}>
      {typeConfig.label}
    </Badge>
  )
}

export default function ScheduleLessonsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSchool, setSelectedSchool] = useState('all')
  const [selectedSport, setSelectedSport] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredLessons = demoLessons.filter(lesson => {
    const matchesDate = lesson.date === selectedDate
    const matchesSchool = selectedSchool === 'all' || lesson.school === selectedSchool
    const matchesSport = selectedSport === 'all' || lesson.sport === selectedSport
    const matchesSearch =
      lesson.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.assignedCoaches.some(coach => coach.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesDate && matchesSchool && matchesSport && matchesSearch
  })

  const getSchoolBadge = (school: string) => (
    <Badge variant="outline" className="text-xs">
      {school === 'ageo' ? '上尾校' : '桶川校'}
    </Badge>
  )

  const getClassTypeBadge = (classType: string) => (
    <Badge variant="secondary" className="text-xs">
      {classType === 'preschool' ? '未就学児' : '小学生'}
    </Badge>
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: '予定', color: 'bg-blue-100 text-blue-800' },
      confirmed: { label: '確定', color: 'bg-green-100 text-green-800' },
      in_progress: { label: '実施中', color: 'bg-orange-100 text-orange-800' },
      completed: { label: '完了', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-800' },
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
      return { text: '満員', color: 'text-red-600', icon: <AlertCircle className="h-3 w-3" /> }
    } else if (percentage >= 80) {
      return { text: 'もうすぐ満員', color: 'text-orange-600', icon: <Users className="h-3 w-3" /> }
    } else {
      return { text: '空きあり', color: 'text-green-600', icon: <Users className="h-3 w-3" /> }
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">レッスン日程</h1>
          <p className="text-muted-foreground mt-2">
            レッスンのスケジュールを管理します
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              レッスン作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいレッスンを作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                レッスン作成機能は開発中です
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredLessons.length}</div>
              <div className="text-xs text-muted-foreground">本日のレッスン</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredLessons.filter(l => l.status === 'confirmed').length}
              </div>
              <div className="text-xs text-muted-foreground">確定済み</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredLessons.reduce((sum, lesson) => sum + lesson.enrolledCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">参加予定生徒</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredLessons.flatMap(l => l.assignedCoaches)).size}
              </div>
              <div className="text-xs text-muted-foreground">担当講師数</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="text-sm font-medium mb-2 block">日付</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 mt-6" />
              <label className="text-sm font-medium mb-2 block">検索</label>
              <Input
                placeholder="スポーツ・講師名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">校舎</label>
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
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">スポーツ</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="スポーツで絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全スポーツ</SelectItem>
                  <SelectItem value="volleyball">バレーボール</SelectItem>
                  <SelectItem value="basketball">バスケットボール</SelectItem>
                  <SelectItem value="soccer">サッカー</SelectItem>
                  <SelectItem value="tennis">テニス</SelectItem>
                  <SelectItem value="rugby">ラグビー</SelectItem>
                  <SelectItem value="baseball">野球</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filteredLessons.length}件のレッスン
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* レッスン一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>レッスン一覧 - {new Date(selectedDate).toLocaleDateString('ja-JP')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>時間</TableHead>
                <TableHead>スポーツ</TableHead>
                <TableHead>校舎・クラス</TableHead>
                <TableHead>トレーニング</TableHead>
                <TableHead>担当講師</TableHead>
                <TableHead>参加者</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>メニュー</TableHead>
                <TableHead className="w-20">操作</TableHead>
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
                        <span className="text-muted-foreground">未設定</span>
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
                        <Button variant="ghost" size="sm">
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
              <p>該当するレッスンがありません</p>
              <p className="text-sm mt-2">日付や条件を変更してください</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}