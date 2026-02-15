'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Activity,
  Bell,
  BookOpen,
  Award,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  UserCheck,
  BarChart3,
  FileText,
  MessageSquare,
  DollarSign,
  ClipboardList,
  CalendarDays,
  Video,
} from 'lucide-react'

interface DashboardStats {
  totalCoaches: number
  activeCoaches: number
  totalStudents: number
  activeStudents: number
  totalLessons: number
  completedLessons: number
  upcomingLessons: number
  totalEvaluations: number
  averageRating: number
  goalAchievementRate: number
  badgesEarned: number
  certificationsExpiring: number
  recentActivities: Activity[]
  weeklyProgress: WeeklyProgress[]
  sportDistribution: SportDistribution[]
  notifications: NotificationSummary[]
  todayLessons: TodayLesson[]
  badgeAlerts: BadgeAlert[]
}

interface Activity {
  id: string
  type: 'lesson' | 'evaluation' | 'badge' | 'goal' | 'notification'
  title: string
  description: string
  timestamp: string
  user: string
  icon: string
}

interface WeeklyProgress {
  day: string
  lessons: number
  evaluations: number
  students: number
}

interface SportDistribution {
  sport: string
  studentCount: number
  lessonCount: number
  color: string
}

interface NotificationSummary {
  id: string
  title: string
  category: string
  priority: string
  timestamp: string
}

interface TodayLesson {
  id: string
  time: string
  school: string
  classType: string
  coaches: string[]
}

interface BadgeAlert {
  id: string
  studentName: string
  sport: string
  badge: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('week')
  const t = useTranslations()

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // APIからデータを取得
      const response = await fetch(`/api/dashboard/stats?range=${dateRange}`)
      const data = await response.json()

      if (data.error) {
        console.error('Dashboard API error:', data.error)
        // エラー時はデフォルト値を設定
        setStats({
          totalCoaches: 0,
          activeCoaches: 0,
          totalStudents: 0,
          activeStudents: 0,
          totalLessons: 0,
          completedLessons: 0,
          upcomingLessons: 0,
          totalEvaluations: 0,
          averageRating: 0,
          goalAchievementRate: 0,
          badgesEarned: 0,
          certificationsExpiring: 0,
          todayLessons: [],
          badgeAlerts: [],
          recentActivities: [],
          weeklyProgress: [],
          sportDistribution: [],
          notifications: [],
        })
        return
      }

      // APIレスポンスを既存のDashboardStats形式に変換
      const convertedData: DashboardStats = {
        totalCoaches: data.stats?.overview?.totalCoaches || 0,
        activeCoaches: data.stats?.overview?.totalCoaches || 0,
        totalStudents: data.stats?.overview?.totalStudents || 0,
        activeStudents: data.stats?.overview?.activeStudents || 0,
        totalLessons: data.stats?.attendance?.total || 0,
        completedLessons: data.stats?.missions?.completed || 0,
        upcomingLessons: data.stats?.missions?.inProgress || 0,
        totalEvaluations: data.stats?.overview?.totalEvaluations || 0,
        averageRating: parseFloat(data.stats?.evaluations?.averageRating || '0'),
        goalAchievementRate: data.stats?.missions?.averageCompletion || 0,
        badgesEarned: data.stats?.overview?.totalBadges || 0,
        certificationsExpiring: data.stats?.alerts?.filter((a: any) => a.type === 'warning').length || 0,
        todayLessons: [],
        badgeAlerts: [],
        recentActivities: [],
        weeklyProgress: data.stats?.evaluations?.recentTrend?.map((trend: any, index: number) => ({
          day: ['月', '火', '水', '木', '金', '土', '日'][index] || trend.week,
          lessons: trend.count,
          evaluations: Math.floor(trend.count * 0.4),
          students: Math.floor(trend.count * 3.2),
        })) || [],
        sportDistribution: Object.entries(data.stats?.evaluations?.bySport || {}).map(([sport, count]) => ({
          sport,
          studentCount: count as number,
          lessonCount: Math.floor((count as number) * 1.8),
          color: sport === 'basketball' ? '#f97316' : sport === 'soccer' ? '#22c55e' : '#3b82f6',
        })),
        notifications: data.stats?.alerts?.map((alert: any, index: number) => ({
          id: `${index + 1}`,
          title: alert.title,
          category: alert.type === 'warning' ? 'alert' : alert.type === 'success' ? 'achievement' : 'info',
          priority: alert.type === 'warning' ? 'high' : 'medium',
          timestamp: '最近',
        })) || [],
      }

      setStats(convertedData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{t('dashboard.loadError')}</p>
        </div>
      </div>
    )
  }

  const currentMonth = new Date().toLocaleDateString('ja-JP', { month: 'long' })
  const currentSport = 'バレーボール'

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {currentMonth}のスポーツ: 🏐 {currentSport}
          </p>
        </div>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t('lessons.today')}</SelectItem>
            <SelectItem value="week">{t('lessons.thisWeek')}</SelectItem>
            <SelectItem value="month">{t('lessons.thisMonth')}</SelectItem>
            <SelectItem value="year">今年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 主要統計 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('navigation.coaches')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoaches}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCoaches} 名が稼働中
            </p>
            <Progress value={(stats.activeCoaches / stats.totalCoaches) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.statistics.totalStudents')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 inline-flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12%
              </span>
              {' '}前月比
            </p>
            <Progress value={(stats.activeStudents / stats.totalStudents) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">レッスン実施数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingLessons} 件の予定
            </p>
            <Progress value={(stats.completedLessons / stats.totalLessons) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均評価</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <div className="flex items-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(stats.averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                ({stats.totalEvaluations} 件)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 今日のレッスン */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            今日のレッスン
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.todayLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline">{lesson.time}</Badge>
                <span className="font-medium">{lesson.school}</span>
                <span className="text-muted-foreground">{lesson.classType}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                担当: {lesson.coaches.join(', ')}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* サブ統計 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.goalAchievementRate}%</div>
            <Progress value={stats.goalAchievementRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">バッジ獲得数</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.badgesEarned}</div>
            <p className="text-xs text-muted-foreground">今月の獲得数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">要対応</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificationsExpiring}</div>
            <p className="text-xs text-orange-600">資格更新期限間近</p>
          </CardContent>
        </Card>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">最近のアクティビティ</TabsTrigger>
          <TabsTrigger value="progress">週間進捗</TabsTrigger>
          <TabsTrigger value="sports">スポーツ別統計</TabsTrigger>
          <TabsTrigger value="alerts">アラート</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近のアクティビティ</CardTitle>
              <CardDescription>
                システム内の最新の活動状況
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>週間進捗</CardTitle>
              <CardDescription>
                今週の活動推移
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.weeklyProgress.map((day) => (
                  <div key={day.day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium w-8">{day.day}</span>
                      <div className="flex-1 grid grid-cols-3 gap-4 ml-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{day.lessons} レッスン</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{day.evaluations} 評価</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{day.students} 生徒</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={(day.lessons / 30) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>スポーツ別統計</CardTitle>
              <CardDescription>
                各スポーツの生徒数とレッスン実施状況
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.sportDistribution.map((sport) => (
                  <div key={sport.sport} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sport.color }}
                        />
                        <span className="text-sm font-medium">{sport.sport}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{sport.studentCount} 生徒</span>
                        <span>{sport.lessonCount} レッスン</span>
                      </div>
                    </div>
                    <Progress
                      value={(sport.studentCount / stats.totalStudents) * 100}
                      className="h-2"
                      style={{
                        '--progress-color': sport.color,
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* バッジ付与アラート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  バッジ付与予定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.badgeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">{alert.studentName}</span>
                      <span className="text-sm text-muted-foreground">
                        - {alert.sport} {alert.badge}
                      </span>
                    </div>
                    <Badge className="bg-amber-600">Ready!</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 通知 */}
            <Card>
              <CardHeader>
                <CardTitle>最近の通知</CardTitle>
                <CardDescription>
                  重要な通知と更新情報
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center gap-4">
                      <Bell className={`h-4 w-4 ${
                        notification.priority === 'high'
                          ? 'text-red-500'
                          : 'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={
                            notification.priority === 'high'
                              ? 'destructive'
                              : 'secondary'
                          }>
                            {notification.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/notifications">
                      すべての通知を見る
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* クイックアクション */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/lessons/menus/new">
          <Button variant="outline" className="w-full h-24 flex-col gap-2">
            <ClipboardList className="h-6 w-6" />
            <span>レッスン作成</span>
          </Button>
        </Link>
        <Link href="/students">
          <Button variant="outline" className="w-full h-24 flex-col gap-2">
            <Users className="h-6 w-6" />
            <span>生徒管理</span>
          </Button>
        </Link>
        <Link href="/content/videos">
          <Button variant="outline" className="w-full h-24 flex-col gap-2">
            <Video className="h-6 w-6" />
            <span>コンテンツ</span>
          </Button>
        </Link>
        <Link href="/sports">
          <Button variant="outline" className="w-full h-24 flex-col gap-2">
            <Trophy className="h-6 w-6" />
            <span>スポーツ管理</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}