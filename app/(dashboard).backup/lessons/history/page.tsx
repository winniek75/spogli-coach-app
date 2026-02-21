'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Calendar,
  Search,
  Star,
  TrendingUp,
  Trophy,
  Target,
  BarChart3,
  Award,
  Users,
} from 'lucide-react'

// デモデータ
const demoEvaluations = [
  {
    id: '1',
    studentId: '1',
    studentName: '田中太郎',
    studentLevel: 2,
    date: '2025-01-20',
    sport: 'volleyball',
    category: 'catch',
    skill: '両手を前に出して構えられる',
    rating: 3,
    coach: 'Risa',
    notes: 'とても上手にできています',
  },
  {
    id: '2',
    studentId: '1',
    studentName: '田中太郎',
    studentLevel: 2,
    date: '2025-01-20',
    sport: 'volleyball',
    category: 'catch',
    skill: 'ゆっくり投げられたボールをキャッチできる',
    rating: 2,
    coach: 'Risa',
    notes: 'もう少し練習が必要',
  },
  {
    id: '3',
    studentId: '2',
    studentName: '鈴木花子',
    studentLevel: 3,
    date: '2025-01-19',
    sport: 'basketball',
    category: 'dribble',
    skill: '片手でドリブルできる',
    rating: 3,
    coach: 'Aung',
    notes: '素晴らしい上達ぶりです',
  },
]

const demoStudents = [
  { id: '1', name: '田中太郎', level: 2, photoUrl: null },
  { id: '2', name: '鈴木花子', level: 3, photoUrl: null },
  { id: '3', name: '佐藤次郎', level: 4, photoUrl: null },
  { id: '4', name: '山田花子', level: 1, photoUrl: null },
]

export default function LessonsHistoryPage() {
  const [selectedStudent, setSelectedStudent] = useState('all')
  const [selectedSport, setSelectedSport] = useState('all')
  const [selectedDateFrom, setSelectedDateFrom] = useState('')
  const [selectedDateTo, setSelectedDateTo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEvaluations = demoEvaluations.filter(evaluation => {
    const matchesStudent = selectedStudent === 'all' || evaluation.studentId === selectedStudent
    const matchesSport = selectedSport === 'all' || evaluation.sport === selectedSport
    const matchesSearch = evaluation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.skill.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDateFrom = !selectedDateFrom || evaluation.date >= selectedDateFrom
    const matchesDateTo = !selectedDateTo || evaluation.date <= selectedDateTo

    return matchesStudent && matchesSport && matchesSearch && matchesDateFrom && matchesDateTo
  })

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

  const getStarRating = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getProgressStats = () => {
    const totalEvaluations = filteredEvaluations.length
    const excellentRatings = filteredEvaluations.filter(e => e.rating === 3).length
    const goodRatings = filteredEvaluations.filter(e => e.rating === 2).length
    const needsImprovementRatings = filteredEvaluations.filter(e => e.rating === 1).length

    return {
      total: totalEvaluations,
      excellent: excellentRatings,
      good: goodRatings,
      needsImprovement: needsImprovementRatings,
      excellentPercentage: totalEvaluations > 0 ? (excellentRatings / totalEvaluations) * 100 : 0,
    }
  }

  const stats = getProgressStats()

  const getStudentProgress = () => {
    const studentProgress = demoStudents.map(student => {
      const studentEvaluations = filteredEvaluations.filter(e => e.studentId === student.id)
      const recentEvaluations = studentEvaluations.slice(0, 5)
      const averageRating = recentEvaluations.length > 0
        ? recentEvaluations.reduce((sum, e) => sum + e.rating, 0) / recentEvaluations.length
        : 0

      const excellentCount = studentEvaluations.filter(e => e.rating === 3).length

      return {
        ...student,
        totalEvaluations: studentEvaluations.length,
        averageRating,
        excellentCount,
        recentTrend: recentEvaluations.slice(0, 3).map(e => e.rating),
      }
    })

    return studentProgress.filter(p => p.totalEvaluations > 0)
  }

  const studentProgress = getStudentProgress()

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">評価履歴</h1>
          <p className="text-muted-foreground mt-2">
            レッスンでの評価記録を確認・分析します
          </p>
        </div>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">評価履歴</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="progress">生徒別進捗</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {/* 統計カード */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">総評価数</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.excellent}</div>
                  <div className="text-xs text-muted-foreground">⭐⭐⭐ 評価</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.good}</div>
                  <div className="text-xs text-muted-foreground">⭐⭐ 評価</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.excellentPercentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">優秀率</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* フィルター */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="生徒名・スキルで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="生徒で絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全生徒</SelectItem>
                    {demoStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
                  </SelectContent>
                </Select>

                <div>
                  <label className="text-xs text-muted-foreground">開始日</label>
                  <Input
                    type="date"
                    value={selectedDateFrom}
                    onChange={(e) => setSelectedDateFrom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">終了日</label>
                  <Input
                    type="date"
                    value={selectedDateTo}
                    onChange={(e) => setSelectedDateTo(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{filteredEvaluations.length}</div>
                    <div className="text-xs text-muted-foreground">評価記録</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 評価履歴一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>評価履歴一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>生徒</TableHead>
                    <TableHead>スポーツ</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>スキル項目</TableHead>
                    <TableHead>評価</TableHead>
                    <TableHead>担当講師</TableHead>
                    <TableHead>メモ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        {new Date(evaluation.date).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {evaluation.studentName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{evaluation.studentName}</div>
                            <div className="text-xs text-muted-foreground">Lv{evaluation.studentLevel}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{getSportIcon(evaluation.sport)}</span>
                          <span className="text-sm capitalize">{evaluation.sport}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {evaluation.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{evaluation.skill}</TableCell>
                      <TableCell>{getStarRating(evaluation.rating)}</TableCell>
                      <TableCell className="text-sm">{evaluation.coach}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                        {evaluation.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredEvaluations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>該当する評価記録がありません</p>
                  <p className="text-sm mt-2">フィルター条件を変更してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* 分析レポート */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  評価分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="flex">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      優秀
                    </span>
                    <span className="font-semibold">{stats.excellent}件</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="flex">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      良好
                    </span>
                    <span className="font-semibold">{stats.good}件</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="flex">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-gray-300" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      要改善
                    </span>
                    <span className="font-semibold">{stats.needsImprovement}件</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  改善ポイント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">強み</p>
                    <p className="text-blue-600">キャッチスキルの習得が順調です</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-800">課題</p>
                    <p className="text-orange-600">トススキルに重点的な指導が必要</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">次のステップ</p>
                    <p className="text-green-600">応用練習への移行を検討</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* 生徒別進捗 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                生徒別進捗サマリー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {studentProgress.map(student => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">Lv{student.level}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>総評価数:</span>
                        <span className="font-medium">{student.totalEvaluations}件</span>
                      </div>
                      <div className="flex justify-between">
                        <span>平均評価:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="font-medium">{student.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>⭐⭐⭐ 評価:</span>
                        <span className="font-medium text-yellow-600">{student.excellentCount}件</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>最近の傾向:</span>
                        <div className="flex gap-1">
                          {student.recentTrend.map((rating, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                rating === 3 ? 'bg-green-400' :
                                rating === 2 ? 'bg-yellow-400' : 'bg-orange-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {studentProgress.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>評価データのある生徒がいません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}