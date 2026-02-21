'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  Trophy,
  Target,
  Activity,
  TrendingUp,
  Clock,
  Users,
  Calendar,
} from 'lucide-react'

export default function SportDetailPage() {
  const params = useParams()
  const locale = params.locale as string
  const sportId = params.id as string
  const t = useTranslations('schedule.sports')

  // Demo data - in production, this would come from an API
  const sport = {
    id: sportId,
    code: 'volleyball',
    name: 'バレーボール',
    name_en: 'Volleyball',
    icon: '🏐',
    color: '#4F46E5',
    description: 'チームワークと基本的なボールハンドリングスキルを身につけます',
    description_en: 'Develop teamwork and basic ball handling skills',
    category: { id: 'ball', name: '球技' },
    is_active: true,
    objectives: [
      { id: '1', name: '両手でボールをキャッチできる', level: 1 },
      { id: '2', name: 'アンダーハンドパスができる', level: 2 },
    ],
    skills: [
      { id: '1', name: 'キャッチ', category: 'basic' },
      { id: '2', name: 'トス', category: 'basic' },
    ],
    levels: [
      { id: '1', level: 1, name: '初級' },
      { id: '2', level: 2, name: '中級' },
    ],
    equipment: ['バレーボール', 'ネット'],
    created_at: '2024-01-15',
    updated_at: '2024-01-20',
  }

  const isJapanese = locale === 'ja'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/sports`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isJapanese ? sport.name : sport.name_en}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('code')}: {sport.code}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/sports/${sport.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${sport.color}20` }}
                >
                  {sport.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{isJapanese ? sport.name : sport.name_en}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isJapanese ? sport.description : sport.description_en}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {sport.category && (
                      <Badge variant="secondary">{sport.category.name}</Badge>
                    )}
                    <Badge variant={sport.is_active ? 'default' : 'secondary'}>
                      {sport.is_active ? t('active') : t('inactive')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('objectives')}
              </CardTitle>
              <CardDescription>
                {t('objectivesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sport.objectives && sport.objectives.length > 0 ? (
                <div className="space-y-3">
                  {sport.objectives.map((objective) => (
                    <div key={objective.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{objective.name}</span>
                      <Badge variant="outline">
                        {t('level')} {objective.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noObjectives')}</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {t('skills')}
              </CardTitle>
              <CardDescription>
                {t('skillsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sport.skills && sport.skills.length > 0 ? (
                <div className="space-y-3">
                  {sport.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{skill.name}</span>
                      <Badge variant="outline">{skill.category}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noSkills')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('equipment')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sport.equipment && sport.equipment.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sport.equipment.map((item, index) => (
                    <Badge key={index} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noEquipment')}</p>
              )}
            </CardContent>
          </Card>

          {/* Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('levels')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sport.levels && sport.levels.length > 0 ? (
                <div className="space-y-2">
                  {sport.levels.map((level) => (
                    <div key={level.id} className="flex items-center justify-between">
                      <span className="text-sm">{level.name}</span>
                      <Badge variant="outline">
                        {t('level')} {level.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noLevels')}</p>
              )}
            </CardContent>
          </Card>

          {/* Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('metaInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('createdAt')}</span>
                <span>{new Date(sport.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('updatedAt')}</span>
                <span>{new Date(sport.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/${locale}/sports/${sport.id}/goals`}>
                  <Target className="h-4 w-4 mr-2" />
                  {t('goalManagement')}
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/${locale}/schedule/lessons?sport=${sport.code}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('viewLessons')}
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/${locale}/students?sport=${sport.code}`}>
                  <Users className="h-4 w-4 mr-2" />
                  {t('viewStudents')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}