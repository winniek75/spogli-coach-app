'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  X,
} from 'lucide-react'
import { useLessonMenus } from '@/hooks/use-lesson-menus'
import { WeekType } from '@/types/lesson-menu'

interface Activity {
  name: string
  duration: number
  description: string
}

const SPORT_LABELS: Record<string, string> = {
  volleyball: 'バレーボール',
  basketball: 'バスケットボール',
  soccer: 'サッカー',
  tennis: 'テニス',
  tag_rugby: 'タグラグビー',
  baseball: '野球',
  badminton: 'バドミントン',
  dance: 'ダンス',
}

const WEEK_LABELS: Record<string, string> = {
  week1: '第1週',
  week2: '第2週',
  week3: '第3週',
  week4: '第4週',
  backup: '振替用',
}

export default function NewMenuPage() {
  const router = useRouter()
  const { createLessonMenu } = useLessonMenus()

  // 基本情報
  const [sport, setSport] = useState('')
  const [classType, setClassType] = useState('')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [weekType, setWeekType] = useState<string>('')

  // ウォームアップ（時間と内容だけ）
  const [warmupDuration, setWarmupDuration] = useState(5)
  const [warmupNotes, setWarmupNotes] = useState('')

  // メインアクティビティ
  const [activities, setActivities] = useState<Activity[]>([
    { name: '', duration: 10, description: '' }
  ])

  // クールダウン
  const [cooldownDuration, setCooldownDuration] = useState(5)
  const [cooldownNotes, setCooldownNotes] = useState('')

  // 英語フレーズ
  const [englishPhrases, setEnglishPhrases] = useState<string[]>([])
  const [newPhrase, setNewPhrase] = useState('')

  // 備考
  const [notes, setNotes] = useState('')

  const getTotalDuration = () => {
    const activityTime = activities.reduce((sum, item) => sum + item.duration, 0)
    return warmupDuration + activityTime + cooldownDuration
  }

  // タイトル自動生成
  const getAutoTitle = () => {
    const sportName = SPORT_LABELS[sport] || sport
    const weekName = WEEK_LABELS[weekType] || weekType
    const className = classType === 'preschool' ? '幼児' : classType === 'elementary' ? '小学生' : ''
    if (!sport || !weekType || !month) return ''
    const m = month.split('-')[1]
    return `${sportName} ${className} ${parseInt(m)}月${weekName}`
  }

  const addActivity = () => {
    setActivities([...activities, { name: '', duration: 10, description: '' }])
  }

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index))
    }
  }

  const updateActivity = (index: number, field: keyof Activity, value: any) => {
    const updated = [...activities]
    updated[index] = { ...updated[index], [field]: value }
    setActivities(updated)
  }

  const addEnglishPhrase = () => {
    if (newPhrase.trim()) {
      setEnglishPhrases([...englishPhrases, newPhrase.trim()])
      setNewPhrase('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!sport || !classType || !month || !weekType) {
      alert('スポーツ、クラス、月、週を選択してください')
      return
    }

    const allActivities = [
      ...(warmupNotes || warmupDuration ? [{ title: warmupNotes || 'ウォームアップ', duration_minutes: warmupDuration, activity_type: 'warmup', order_index: 0 }] : []),
      ...activities.filter(a => a.name).map((a, i) => ({ title: a.name, description: a.description, duration_minutes: a.duration, activity_type: 'technical_drill', order_index: i + 1 })),
      ...(cooldownNotes || cooldownDuration ? [{ title: cooldownNotes || 'クールダウン', duration_minutes: cooldownDuration, activity_type: 'cooldown', order_index: activities.length + 1 }] : []),
    ]

    createLessonMenu({
      title: getAutoTitle(),
      description: notes || '',
      sport,
      class_type: classType as 'preschool' | 'elementary',
      week_type: weekType as WeekType,
      month,
      level: 1,
      duration_minutes: getTotalDuration(),
      max_participants: 20,
      equipment: [],
      objectives: [],
      activities: allActivities,
      english_phrases: englishPhrases,
    })

    router.push('/lessons/menus')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lessons/menus">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新規レッスンメニュー作成</h1>
          {getAutoTitle() && (
            <p className="text-muted-foreground mt-1">{getAutoTitle()}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報: スポーツ・クラス・月・週 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>スポーツ、クラス、対象の月と週を選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>スポーツ *</Label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPORT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>対象クラス *</Label>
                <Select value={classType} onValueChange={setClassType}>
                  <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">幼児</SelectItem>
                    <SelectItem value="elementary">小学生</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>月 *</Label>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
              <div>
                <Label>週 *</Label>
                <Select value={weekType} onValueChange={setWeekType}>
                  <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(WEEK_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              合計時間: {getTotalDuration()}分
            </div>
          </CardContent>
        </Card>

        {/* ウォームアップ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              ウォームアップ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[1fr,80px] gap-3 items-end">
              <div>
                <Label>内容（任意）</Label>
                <Input
                  value={warmupNotes}
                  onChange={(e) => setWarmupNotes(e.target.value)}
                  placeholder="例: ジョギング、ストレッチ、鬼ごっこ"
                />
              </div>
              <div>
                <Label>分</Label>
                <Input
                  type="number"
                  value={warmupDuration}
                  onChange={(e) => setWarmupDuration(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* メインアクティビティ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
              メインアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((item, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">活動 {index + 1}</Label>
                  {activities.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeActivity(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr,80px] gap-3">
                  <Input
                    placeholder="活動名"
                    value={item.name}
                    onChange={(e) => updateActivity(index, 'name', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="分"
                    value={item.duration}
                    onChange={(e) => updateActivity(index, 'duration', parseInt(e.target.value) || 0)}
                  />
                </div>
                <Input
                  placeholder="詳細・ポイント（任意）"
                  value={item.description}
                  onChange={(e) => updateActivity(index, 'description', e.target.value)}
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addActivity}>
              <Plus className="h-4 w-4 mr-2" />
              活動を追加
            </Button>
          </CardContent>
        </Card>

        {/* クールダウン */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              クールダウン
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[1fr,80px] gap-3 items-end">
              <div>
                <Label>内容（任意）</Label>
                <Input
                  value={cooldownNotes}
                  onChange={(e) => setCooldownNotes(e.target.value)}
                  placeholder="例: ストレッチ、振り返り"
                />
              </div>
              <div>
                <Label>分</Label>
                <Input
                  type="number"
                  value={cooldownDuration}
                  onChange={(e) => setCooldownDuration(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 英語フレーズ */}
        <Card>
          <CardHeader>
            <CardTitle>英語フレーズ（任意）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="例: Good job!"
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEnglishPhrase() } }}
              />
              <Button type="button" variant="outline" onClick={addEnglishPhrase} disabled={!newPhrase.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {englishPhrases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {englishPhrases.map((phrase, index) => (
                  <Badge key={index} variant="secondary">
                    {phrase}
                    <button type="button" className="ml-1.5 hover:text-red-600" onClick={() => setEnglishPhrases(prev => prev.filter((_, i) => i !== index))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 備考 */}
        <Card>
          <CardHeader>
            <CardTitle>備考（任意）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="指導上の注意点など" rows={2} />
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/lessons/menus">キャンセル</Link>
          </Button>
          <Button type="submit">メニューを作成</Button>
        </div>
      </form>
    </div>
  )
}
