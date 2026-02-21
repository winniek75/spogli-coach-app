'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Target,
  Plus,
  TrendingUp,
  Trophy,
  CheckCircle,
  Circle,
} from 'lucide-react'

export default function SportGoalsPage() {
  const params = useParams()
  const locale = params.locale as string
  const sportId = params.id as string
  const t = useTranslations('schedule.sports')

  // Demo goals data
  const goals = [
    {
      id: '1',
      title: '基本スキルマスター',
      description: '全ての基本スキルを習得する',
      progress: 75,
      totalObjectives: 4,
      completedObjectives: 3,
      status: 'in_progress',
      objectives: [
        { id: '1', name: '両手でボールをキャッチできる', completed: true },
        { id: '2', name: 'アンダーハンドパスができる', completed: true },
        { id: '3', name: 'オーバーハンドパスができる', completed: true },
        { id: '4', name: 'サーブができる', completed: false },
      ]
    },
    {
      id: '2',
      title: 'チームプレイヤー',
      description: 'チームワークスキルを向上させる',
      progress: 50,
      totalObjectives: 4,
      completedObjectives: 2,
      status: 'in_progress',
      objectives: [
        { id: '5', name: 'ポジション理解', completed: true },
        { id: '6', name: 'コミュニケーション', completed: true },
        { id: '7', name: '戦術理解', completed: false },
        { id: '8', name: 'リーダーシップ', completed: false },
      ]
    },
    {
      id: '3',
      title: '上級テクニック',
      description: '高度な技術を習得する',
      progress: 0,
      totalObjectives: 3,
      completedObjectives: 0,
      status: 'not_started',
      objectives: [
        { id: '9', name: 'スパイク', completed: false },
        { id: '10', name: 'ブロック', completed: false },
        { id: '11', name: 'フェイント', completed: false },
      ]
    },
  ]

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-gray-300'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{t('completed')}</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">{t('inProgress')}</Badge>
      default:
        return <Badge variant="secondary">{t('notStarted')}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/sports/${sportId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('goalManagement')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('goalManagementDescription')}
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('addGoal')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">{t('totalGoals')}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">{t('inProgressGoals')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">42%</p>
                <p className="text-xs text-muted-foreground">{t('overallProgress')}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">5/11</p>
                <p className="text-xs text-muted-foreground">{t('completedObjectives')}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {goal.description}
                  </CardDescription>
                </div>
                {getStatusBadge(goal.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('progress')}</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{goal.completedObjectives} {t('completed')}</span>
                  <span>{goal.totalObjectives - goal.completedObjectives} {t('remaining')}</span>
                </div>
              </div>

              {/* Objectives List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t('objectives')}</h4>
                <div className="space-y-1">
                  {goal.objectives.map((objective) => (
                    <div
                      key={objective.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                    >
                      {objective.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${objective.completed ? 'text-gray-500 line-through' : ''}`}>
                        {objective.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  {t('editGoal')}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  {t('viewDetails')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('noGoals')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('noGoalsDescription')}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('createFirstGoal')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}