'use client'

import { useState } from 'react'
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
  Print,
  Save,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'

// デモデータ
const demoStudents = [
  { id: '1', name: '田中太郎', level: 2, class: 'preschool' },
  { id: '2', name: '鈴木花子', level: 3, class: 'preschool' },
  { id: '3', name: '佐藤次郎', level: 4, class: 'elementary' },
  { id: '4', name: '山田花子', level: 1, class: 'preschool' },
]

const skillItems = {
  volleyball: {
    catch: [
      { id: 'vb-catch-01', description: '両手を前に出して構えられる', level: 1 },
      { id: 'vb-catch-02', description: 'ゆっくり投げられたボールをキャッチできる', level: 1 },
      { id: 'vb-catch-03', description: '動きながらキャッチできる', level: 2 },
    ],
    toss: [
      { id: 'vb-toss-01', description: 'アンダーハンドで前に投げられる', level: 2 },
      { id: 'vb-toss-02', description: 'パートナーとトス交換ができる', level: 3 },
    ],
  },
  basketball: {
    dribble: [
      { id: 'bb-dribble-01', description: '片手でドリブルできる', level: 2 },
      { id: 'bb-dribble-02', description: '歩きながらドリブルできる', level: 3 },
    ],
  },
}

const demoMissionSheets = [
  {
    id: '1',
    date: '2025-01-20',
    sport: 'volleyball',
    school: 'ageo',
    class: 'preschool',
    coach: 'Risa',
    students: 8,
    evaluations: 24,
    completed: true,
  },
  {
    id: '2',
    date: '2025-01-19',
    sport: 'basketball',
    school: 'okegawa',
    class: 'elementary',
    coach: 'Aung',
    students: 12,
    evaluations: 36,
    completed: true,
  },
]

export default function MissionPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSport, setSelectedSport] = useState('volleyball')
  const [selectedSchool, setSelectedSchool] = useState('ageo')
  const [selectedClass, setSelectedClass] = useState('preschool')
  const [evaluations, setEvaluations] = useState<{ [key: string]: number }>({})
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

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

  const filteredStudents = demoStudents.filter(student =>
    student.class === selectedClass
  )

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
          <h1 className="text-3xl font-bold tracking-tight">ミッションシート</h1>
          <p className="text-muted-foreground mt-2">
            レッスンでの生徒のスキル評価を記録します
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Print className="h-4 w-4 mr-2" />
            印刷
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">ミッション作成</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* レッスン情報設定 */}
          <Card>
            <CardHeader>
              <CardTitle>レッスン情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <label className="text-sm font-medium mb-2 block">日付</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">スポーツ</label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volleyball">バレーボール</SelectItem>
                      <SelectItem value="basketball">バスケットボール</SelectItem>
                      <SelectItem value="soccer">サッカー</SelectItem>
                      <SelectItem value="tennis">テニス</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">校舎</label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageo">上尾校</SelectItem>
                      <SelectItem value="okegawa">桶川校</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">クラス</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">未就学児</SelectItem>
                      <SelectItem value="elementary">小学生</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {getSportIcon(selectedSport)} {filteredStudents.length}名
                    </div>
                    <div className="text-xs text-muted-foreground">参加生徒</div>
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
                スキル評価シート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(currentSkills).map(([category, skills]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold capitalize">
                      {category} ({skills.length}項目)
                    </h3>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-48">生徒名</TableHead>
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
                                      placeholder="メモ..."
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
                    <p>選択されたスポーツのスキル項目がありません</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ミッションシート履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>スポーツ</TableHead>
                    <TableHead>校舎・クラス</TableHead>
                    <TableHead>担当講師</TableHead>
                    <TableHead>参加生徒</TableHead>
                    <TableHead>評価数</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoMissionSheets.map((sheet) => (
                    <TableRow key={sheet.id}>
                      <TableCell>
                        {new Date(sheet.date).toLocaleDateString('ja-JP')}
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
                            {sheet.school === 'ageo' ? '上尾校' : '桶川校'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {sheet.class === 'preschool' ? '未就学児' : '小学生'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{sheet.coach}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {sheet.students}名
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {sheet.evaluations}件
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={sheet.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {sheet.completed ? '完了' : '作成中'}
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
                            <Print className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {demoMissionSheets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>ミッションシートの履歴がありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}