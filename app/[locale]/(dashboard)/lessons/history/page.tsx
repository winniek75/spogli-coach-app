'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
import { useEvaluations } from '@/hooks/use-evaluations'
import { useStudents } from '@/hooks/use-students'

export default function LessonsHistoryPage() {
  const t = useTranslations('schedule.evaluationHistory')
  const { evaluations, loading: evaluationsLoading, fetchEvaluations } = useEvaluations()
  const { students, loading: studentsLoading } = useStudents()

  const [selectedStudent, setSelectedStudent] = useState('all')
  const [selectedSport, setSelectedSport] = useState('all')
  const [selectedDateFrom, setSelectedDateFrom] = useState('')
  const [selectedDateTo, setSelectedDateTo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // フィルターに基づいて評価データを取得
  useEffect(() => {
    const filters = {
      student_id: selectedStudent !== 'all' ? selectedStudent : undefined,
      sport: selectedSport !== 'all' ? selectedSport : undefined,
      date_from: selectedDateFrom || undefined,
      date_to: selectedDateTo || undefined,
      search: searchTerm || undefined
    }

    fetchEvaluations(filters)
  }, [selectedStudent, selectedSport, selectedDateFrom, selectedDateTo, searchTerm])

  const filteredEvaluations = evaluations

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
    const studentProgress = students.map(student => {
      const studentEvaluations = filteredEvaluations.filter(e => e.student_id === student.id)
      const recentEvaluations = studentEvaluations.slice(0, 5)
      const averageRating = recentEvaluations.length > 0
        ? recentEvaluations.reduce((sum, e) => sum + e.rating, 0) / recentEvaluations.length
        : 0

      const excellentCount = studentEvaluations.filter(e => e.rating === 3).length

      return {
        id: student.id,
        name: student.name,
        level: student.level,
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
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">{t('evaluationHistoryTab')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analyticsTab')}</TabsTrigger>
          <TabsTrigger value="progress">{t('studentProgressTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {/* 統計カード */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">{t('totalEvaluations')}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.excellent}</div>
                  <div className="text-xs text-muted-foreground">⭐⭐⭐ {t('evaluation')}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.good}</div>
                  <div className="text-xs text-muted-foreground">⭐⭐ {t('evaluation')}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.excellentPercentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">{t('excellenceRate')}</div>
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
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('filterByStudent')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStudents')}</SelectItem>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('filterBySport')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allSports')}</SelectItem>
                    <SelectItem value="volleyball">{t('volleyball')}</SelectItem>
                    <SelectItem value="basketball">{t('basketball')}</SelectItem>
                    <SelectItem value="soccer">{t('soccer')}</SelectItem>
                    <SelectItem value="tennis">{t('tennis')}</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <label className="text-xs text-muted-foreground">{t('startDate')}</label>
                  <Input
                    type="date"
                    value={selectedDateFrom}
                    onChange={(e) => setSelectedDateFrom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">{t('endDate')}</label>
                  <Input
                    type="date"
                    value={selectedDateTo}
                    onChange={(e) => setSelectedDateTo(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{filteredEvaluations.length}</div>
                    <div className="text-xs text-muted-foreground">{t('evaluationRecords')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 評価履歴一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('evaluationHistoryList')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('student')}</TableHead>
                    <TableHead>{t('sport')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('skillItem')}</TableHead>
                    <TableHead>{t('evaluation')}</TableHead>
                    <TableHead>{t('assignedCoach')}</TableHead>
                    <TableHead>{t('memo')}</TableHead>
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
                              {evaluation.student_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{evaluation.student_name}</div>
                            <div className="text-xs text-muted-foreground">Lv{evaluation.student_level}</div>
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
                  <p>{t('noEvaluationRecords')}</p>
                  <p className="text-sm mt-2">{t('changeFilterConditions')}</p>
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
                  {t('evaluationDistribution')}
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
                      {t('excellent')}
                    </span>
                    <span className="font-semibold">{stats.excellent}{t('count')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="flex">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      {t('good')}
                    </span>
                    <span className="font-semibold">{stats.good}{t('count')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="flex">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-gray-300" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      {t('needsImprovement')}
                    </span>
                    <span className="font-semibold">{stats.needsImprovement}{t('count')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('improvementPoints')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">{t('strengths')}</p>
                    <p className="text-blue-600">{t('catchSkillProgress')}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-800">{t('challenges')}</p>
                    <p className="text-orange-600">{t('tossSkillGuidance')}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">{t('nextSteps')}</p>
                    <p className="text-green-600">{t('considerAdvancedPractice')}</p>
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
                {t('studentProgressSummary')}
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
                        <span>{t('totalEvaluationsCount')}:</span>
                        <span className="font-medium">{student.totalEvaluations}{t('count')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('averageEvaluation')}:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="font-medium">{student.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>⭐⭐⭐ {t('evaluation')}:</span>
                        <span className="font-medium text-yellow-600">{student.excellentCount}{t('count')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{t('recentTrend')}:</span>
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
                  <p>{t('noStudentsWithEvaluation')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}