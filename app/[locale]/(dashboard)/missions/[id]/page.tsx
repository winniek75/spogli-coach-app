'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useMission } from '@/hooks/use-missions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  MapPin,
  Edit,
  CheckCircle,
  Clock,
  FileText,
  Target,
  AlertTriangle,
  Save,
} from 'lucide-react'

export default function MissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { missionSheet, loading, error } = useMission(id)
  const tMissions = useTranslations('missions')
  const tCommon = useTranslations('common')

  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5 text-gray-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: tMissions('draft'), color: 'bg-gray-600' },
      in_progress: { label: tMissions('inProgress'), color: 'bg-blue-600' },
      completed: { label: tMissions('completed'), color: 'bg-green-600' },
      cancelled: { label: tMissions('cancelled'), color: 'bg-red-600' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const handleItemComplete = (item: any) => {
    setSelectedItem(item)
    setCompletionNotes(item.completion_notes || '')
    setShowCompletionDialog(true)
  }

  const saveCompletion = async () => {
    // この機能はデモでは動作します（実際のアプリでは useMissions フックの updateMissionItem を使用）
    console.log('Completing item:', selectedItem.id, 'with notes:', completionNotes)
    setShowCompletionDialog(false)
    setSelectedItem(null)
    setCompletionNotes('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tMissions('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !missionSheet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || tMissions('notFound')}</p>
          <Button onClick={() => router.push('/missions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tMissions('backToList')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/missions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(missionSheet.status)}
              <h1 className="text-3xl font-bold tracking-tight">{missionSheet.title}</h1>
              {getStatusBadge(missionSheet.status)}
            </div>
            {missionSheet.description && (
              <p className="text-muted-foreground">{missionSheet.description}</p>
            )}
          </div>
        </div>
        <Link href={`/missions/${id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            {tMissions('edit')}
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* メイン情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* ミッション項目 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {tMissions('missionItems')}
              </CardTitle>
              <CardDescription>
                {tMissions('clickToUpdate')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missionSheet.mission_items?.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      item.completed_at
                        ? 'bg-green-50 border-green-200'
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                    onClick={() => !item.completed_at && handleItemComplete(item)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <Checkbox
                          checked={!!item.completed_at}
                          disabled={!!item.completed_at}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{tMissions('item')} {index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          {item.completed_at && (
                            <Badge className="text-xs bg-green-600">
                              {tMissions('completedStatus')}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold mb-1">{item.target_description}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.success_criteria}
                        </p>
                        {item.completion_notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>{tMissions('completionNotes')}:</strong> {item.completion_notes}
                          </div>
                        )}
                        {item.completed_at && (
                          <div className="text-xs text-green-600 mt-2">
                            {tMissions('completionDate')}: {new Date(item.completed_at).toLocaleString('ja-JP')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* プログレス */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tMissions('progressStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {missionSheet.completion_rate}%
                  </div>
                  <p className="text-sm text-muted-foreground">{tMissions('completionRate')}</p>
                </div>
                <Progress value={missionSheet.completion_rate} className="h-3" />
                <div className="text-center text-sm text-muted-foreground">
                  {missionSheet.mission_items?.filter(item => item.completed_at).length || 0} / {missionSheet.mission_items?.length || 0} {tMissions('itemsCompleted')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tMissions('basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{missionSheet.student?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {tMissions('level')} {missionSheet.student?.level}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{missionSheet.coach?.name}</div>
                    <div className="text-sm text-muted-foreground">{tMissions('assignedCoach')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {new Date(missionSheet.lesson_date).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="text-sm text-muted-foreground">{tMissions('lessonDate')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {missionSheet.school === 'ageo' ? tMissions('ageoSchool') : tMissions('okegawaSchool')}
                    </div>
                    <div className="text-sm text-muted-foreground">{tMissions('school')}</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Badge variant="secondary">
                    {missionSheet.sport}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 完了確認ダイアログ */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tMissions('completeItem')}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{selectedItem.target_description}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.success_criteria}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {tMissions('completionNotesOptional')}
                </label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder={tMissions('completionNotesPlaceholder')}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={saveCompletion}>
              <Save className="h-4 w-4 mr-2" />
              {tMissions('saveAsCompleted')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}