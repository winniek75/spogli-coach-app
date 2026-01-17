import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  ClipboardList,
  Trophy,
  CalendarDays,
  Video,
  Award,
  AlertCircle,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  // TODO: 実際のデータはSupabaseから取得
  const todayLessons = [
    {
      id: '1',
      time: '10:10',
      school: '上尾校',
      classType: '未就学児',
      coaches: ['Risa', 'Aung'],
    },
    {
      id: '2',
      time: '14:10',
      school: '桶川校',
      classType: '未就学児',
      coaches: ['Gecko'],
    },
  ]

  const badgeAlerts = [
    {
      id: '1',
      studentName: '田中太郎',
      sport: 'バレーボール',
      badge: 'キャッチバッジ',
    },
    {
      id: '2',
      studentName: '鈴木花子',
      sport: 'ビジョン',
      badge: 'ビジョンバッジ',
    },
  ]

  const certificationAlerts = [
    {
      id: '1',
      coachName: 'Risa',
      certification: 'TEFL資格',
      daysRemaining: 30,
      severity: 'warning',
    },
    {
      id: '2',
      coachName: 'Aung',
      certification: 'スポーツ指導員',
      daysRemaining: 14,
      severity: 'error',
    },
  ]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">
          今月のスポーツ: 🏐 バレーボール
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生徒数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24名</div>
            <p className="text-xs text-muted-foreground">
              上尾校: 12名 / 桶川校: 12名
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本日評価</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/8名</div>
            <p className="text-xs text-muted-foreground">
              未評価: 8名
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">バッジ待ち</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3名</div>
            <p className="text-xs text-muted-foreground">
              授与準備完了
            </p>
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
          {todayLessons.map((lesson) => (
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

      {/* クイックアクション */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/lessons/mission">
          <Button variant="outline" className="w-full h-24 flex-col gap-2">
            <ClipboardList className="h-6 w-6" />
            <span>ミッションシート作成</span>
          </Button>
        </Link>
        <Link href="/students">
          <Button variant="outline" className="w-full h-24 flex-col gap-2">
            <Users className="h-6 w-6" />
            <span>生徒一覧確認</span>
          </Button>
        </Link>
        <Link href="/content/videos">
          <Button variant="outline" className="w-full h-24 flex-col gap-2">
            <Video className="h-6 w-6" />
            <span>レッスン動画</span>
          </Button>
        </Link>
        <Link href="/sports">
          <Button variant="outline" className="w-full h-24 flex-col gap-2">
            <Trophy className="h-6 w-6" />
            <span>進捗確認</span>
          </Button>
        </Link>
      </div>

      {/* アラート */}
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
            {badgeAlerts.map((alert) => (
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

        {/* 資格期限アラート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              資格期限アラート
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {certificationAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  alert.severity === 'error'
                    ? 'bg-red-50 dark:bg-red-950/20'
                    : 'bg-amber-50 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock
                    className={`h-4 w-4 ${
                      alert.severity === 'error' ? 'text-red-600' : 'text-amber-600'
                    }`}
                  />
                  <span className="font-medium">{alert.coachName}</span>
                  <span className="text-sm text-muted-foreground">
                    - {alert.certification}
                  </span>
                </div>
                <Badge
                  variant={alert.severity === 'error' ? 'destructive' : 'default'}
                  className={alert.severity === 'error' ? '' : 'bg-amber-600'}
                >
                  残り{alert.daysRemaining}日
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}