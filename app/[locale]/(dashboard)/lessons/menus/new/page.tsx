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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  X,
  Video,
  PlayCircle,
} from 'lucide-react'
import { VideoSelectorModal } from '@/components/video-selector-modal'

interface Activity {
  name: string
  duration: number
  description: string
  equipment: string[]
  videoInfo?: {
    id: string
    title: string
    thumbnailUrl?: string
    duration: number
  }
}

export default function NewMenuPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sport, setSport] = useState('')
  const [classType, setClassType] = useState('')
  const [isTemplate, setIsTemplate] = useState(false)
  const [notes, setNotes] = useState('')

  // ウォームアップ
  const [warmup, setWarmup] = useState<Activity[]>([
    { name: '', duration: 5, description: '', equipment: [] }
  ])

  // メインアクティビティ
  const [activities, setActivities] = useState<Activity[]>([
    { name: '', duration: 10, description: '', equipment: [] }
  ])

  // クールダウン
  const [cooldown, setCooldown] = useState<Activity[]>([
    { name: '', duration: 5, description: '', equipment: [] }
  ])

  // 英語フレーズ
  const [englishPhrases, setEnglishPhrases] = useState<string[]>([''])
  const [newPhrase, setNewPhrase] = useState('')

  // ビデオ選択
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [currentActivityIndex, setCurrentActivityIndex] = useState<number>(-1)
  const [currentActivityType, setCurrentActivityType] = useState<'warmup' | 'activities' | 'cooldown'>('activities')

  const getTotalDuration = () => {
    const warmupTime = warmup.reduce((sum, item) => sum + item.duration, 0)
    const activityTime = activities.reduce((sum, item) => sum + item.duration, 0)
    const cooldownTime = cooldown.reduce((sum, item) => sum + item.duration, 0)
    return warmupTime + activityTime + cooldownTime
  }

  const addActivity = (type: 'warmup' | 'activities' | 'cooldown') => {
    const newActivity: Activity = { name: '', duration: 10, description: '', equipment: [] }
    if (type === 'warmup') {
      setWarmup([...warmup, newActivity])
    } else if (type === 'activities') {
      setActivities([...activities, newActivity])
    } else {
      setCooldown([...cooldown, newActivity])
    }
  }

  const removeActivity = (type: 'warmup' | 'activities' | 'cooldown', index: number) => {
    if (type === 'warmup' && warmup.length > 1) {
      setWarmup(warmup.filter((_, i) => i !== index))
    } else if (type === 'activities' && activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index))
    } else if (type === 'cooldown' && cooldown.length > 1) {
      setCooldown(cooldown.filter((_, i) => i !== index))
    }
  }

  const updateActivity = (
    type: 'warmup' | 'activities' | 'cooldown',
    index: number,
    field: keyof Activity,
    value: any
  ) => {
    const updateList = (list: Activity[]) => {
      const updated = [...list]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    }

    if (type === 'warmup') {
      setWarmup(updateList(warmup))
    } else if (type === 'activities') {
      setActivities(updateList(activities))
    } else {
      setCooldown(updateList(cooldown))
    }
  }

  const addEnglishPhrase = () => {
    if (newPhrase.trim()) {
      setEnglishPhrases([...englishPhrases.filter(p => p), newPhrase])
      setNewPhrase('')
    }
  }

  const removePhrase = (index: number) => {
    setEnglishPhrases(englishPhrases.filter((_, i) => i !== index))
  }

  const openVideoSelector = (type: 'warmup' | 'activities' | 'cooldown', index: number) => {
    setCurrentActivityType(type)
    setCurrentActivityIndex(index)
    setShowVideoModal(true)
  }

  const handleVideoSelect = (video: any) => {
    if (currentActivityIndex >= 0) {
      const videoInfo = {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
      }

      if (currentActivityType === 'warmup') {
        const updated = [...warmup]
        updated[currentActivityIndex] = { ...updated[currentActivityIndex], videoInfo }
        setWarmup(updated)
      } else if (currentActivityType === 'activities') {
        const updated = [...activities]
        updated[currentActivityIndex] = { ...updated[currentActivityIndex], videoInfo }
        setActivities(updated)
      } else {
        const updated = [...cooldown]
        updated[currentActivityIndex] = { ...updated[currentActivityIndex], videoInfo }
        setCooldown(updated)
      }
    }
  }

  const removeVideo = (type: 'warmup' | 'activities' | 'cooldown', index: number) => {
    if (type === 'warmup') {
      const updated = [...warmup]
      delete updated[index].videoInfo
      setWarmup(updated)
    } else if (type === 'activities') {
      const updated = [...activities]
      delete updated[index].videoInfo
      setActivities(updated)
    } else {
      const updated = [...cooldown]
      delete updated[index].videoInfo
      setCooldown(updated)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!title || !sport || !classType) {
      alert('必須項目を入力してください')
      return
    }

    // 実際のアプリではAPI経由で保存
    const newMenu = {
      id: `menu-${Date.now()}`,
      title,
      description,
      sport,
      classType,
      duration: getTotalDuration(),
      warmup: warmup.filter(w => w.name),
      activities: activities.filter(a => a.name),
      cooldown: cooldown.filter(c => c.name),
      englishPhrases: englishPhrases.filter(p => p),
      notes,
      isTemplate,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }

    console.log('新規メニュー:', newMenu)
    router.push('/lessons/menus')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/lessons/menus">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">新規レッスンメニュー作成</h1>
            <p className="text-muted-foreground mt-1">レッスンメニューの詳細を設定してください</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">メニュー名 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: バレーボール基礎練習"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このメニューの概要を入力"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sport">スポーツ *</Label>
                <Select value={sport} onValueChange={setSport} required>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volleyball">バレーボール</SelectItem>
                    <SelectItem value="basketball">バスケットボール</SelectItem>
                    <SelectItem value="soccer">サッカー</SelectItem>
                    <SelectItem value="tennis">テニス</SelectItem>
                    <SelectItem value="rugby">ラグビー</SelectItem>
                    <SelectItem value="baseball">野球</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="classType">対象クラス *</Label>
                <Select value={classType} onValueChange={setClassType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">幼児</SelectItem>
                    <SelectItem value="elementary">小学生</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="template"
                  checked={isTemplate}
                  onCheckedChange={setIsTemplate}
                />
                <Label htmlFor="template">テンプレートとして保存</Label>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">合計時間: {getTotalDuration()}分</span>
              </div>
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
            <CardDescription>準備運動の内容を設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {warmup.map((item, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>活動 {index + 1}</Label>
                  {warmup.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeActivity('warmup', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr,100px] gap-3">
                  <Input
                    placeholder="活動名"
                    value={item.name}
                    onChange={(e) => updateActivity('warmup', index, 'name', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="分"
                    value={item.duration}
                    onChange={(e) => updateActivity('warmup', index, 'duration', parseInt(e.target.value) || 0)}
                  />
                </div>
                <Textarea
                  placeholder="詳細説明（任意）"
                  value={item.description}
                  onChange={(e) => updateActivity('warmup', index, 'description', e.target.value)}
                  rows={2}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addActivity('warmup')}
            >
              <Plus className="h-4 w-4 mr-2" />
              活動を追加
            </Button>
          </CardContent>
        </Card>

        {/* メインアクティビティ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
              メインアクティビティ
            </CardTitle>
            <CardDescription>主要な練習内容を設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((item, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>活動 {index + 1}</Label>
                  {activities.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeActivity('activities', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr,100px] gap-3">
                  <Input
                    placeholder="活動名"
                    value={item.name}
                    onChange={(e) => updateActivity('activities', index, 'name', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="分"
                    value={item.duration}
                    onChange={(e) => updateActivity('activities', index, 'duration', parseInt(e.target.value) || 0)}
                  />
                </div>
                <Textarea
                  placeholder="詳細説明（任意）"
                  value={item.description}
                  onChange={(e) => updateActivity('activities', index, 'description', e.target.value)}
                  rows={2}
                />

                {/* 動画選択 */}
                <div className="space-y-2">
                  <Label className="text-sm">指導動画（任意）</Label>
                  {item.videoInfo ? (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <PlayCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-blue-900 truncate">{item.videoInfo.title}</p>
                          <p className="text-xs text-blue-700">
                            {Math.floor(item.videoInfo.duration / 60)}:{(item.videoInfo.duration % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideo('activities', index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openVideoSelector('activities', index)}
                      className="w-full justify-start"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      動画を選択
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addActivity('activities')}
            >
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
            <CardDescription>整理運動の内容を設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cooldown.map((item, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>活動 {index + 1}</Label>
                  {cooldown.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeActivity('cooldown', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr,100px] gap-3">
                  <Input
                    placeholder="活動名"
                    value={item.name}
                    onChange={(e) => updateActivity('cooldown', index, 'name', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="分"
                    value={item.duration}
                    onChange={(e) => updateActivity('cooldown', index, 'duration', parseInt(e.target.value) || 0)}
                  />
                </div>
                <Textarea
                  placeholder="詳細説明（任意）"
                  value={item.description}
                  onChange={(e) => updateActivity('cooldown', index, 'description', e.target.value)}
                  rows={2}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addActivity('cooldown')}
            >
              <Plus className="h-4 w-4 mr-2" />
              活動を追加
            </Button>
          </CardContent>
        </Card>

        {/* 英語フレーズ */}
        <Card>
          <CardHeader>
            <CardTitle>英語フレーズ（任意）</CardTitle>
            <CardDescription>レッスンで使える英語表現</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="例: Good job!"
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addEnglishPhrase()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addEnglishPhrase}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {englishPhrases.filter(p => p).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {englishPhrases.filter(p => p).map((phrase, index) => (
                  <Badge key={index} variant="secondary" className="pl-3 pr-1">
                    {phrase}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => removePhrase(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
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
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="指導上の注意点など"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/lessons/menus">キャンセル</Link>
          </Button>
          <Button type="submit">
            メニューを作成
          </Button>
        </div>
      </form>

      {/* 動画選択モーダル */}
      <VideoSelectorModal
        open={showVideoModal}
        onOpenChange={setShowVideoModal}
        onSelect={handleVideoSelect}
        sportFilter={sport}
      />
    </div>
  )
}