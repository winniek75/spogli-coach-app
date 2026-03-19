'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  BookOpen,
} from 'lucide-react'
import { LocalStorageService } from '@/lib/local-storage'
import { GoogleDrivePicker } from '@/components/ui/google-drive-picker'
import { convertGoogleDriveImageUrl, isGoogleDriveUrl } from '@/lib/google-drive-utils'

// 型定義
interface GuideSection {
  id: string
  title: string
  content: string
  imageUrl?: string
  imageCaption?: string
  order: number
}

interface SportGuide {
  id: string
  sport: string
  category: string // ルール、基礎技術、練習メニュー例、NGフォーム比較 等
  title: string
  sections: GuideSection[]
  created_at: string
  updated_at: string
}

const STORAGE_KEY = 'sports_guides'

const SPORT_OPTIONS = [
  { value: 'volleyball', label: 'バレーボール', icon: '🏐' },
  { value: 'basketball', label: 'バスケットボール', icon: '🏀' },
  { value: 'soccer', label: 'サッカー', icon: '⚽' },
  { value: 'tennis', label: 'テニス', icon: '🎾' },
  { value: 'tag_rugby', label: 'タグラグビー', icon: '🏉' },
  { value: 'baseball', label: '野球', icon: '⚾' },
  { value: 'badminton', label: 'バドミントン', icon: '🏸' },
  { value: 'dance', label: 'ダンス', icon: '💃' },
]

const CATEGORY_OPTIONS = [
  'ルール・基本知識',
  '基礎技術',
  'フォーム・動き方',
  'NGフォーム比較',
  '練習ドリル',
  '指導のポイント',
  '安全管理',
]

export default function SportsGuidePage() {
  const [guides, setGuides] = useState<SportGuide[]>([])
  const [selectedSport, setSelectedSport] = useState<string>('all')
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)

  // 新規・編集ダイアログ
  const [showDialog, setShowDialog] = useState(false)
  const [editingGuide, setEditingGuide] = useState<SportGuide | null>(null)
  const [formSport, setFormSport] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formSections, setFormSections] = useState<GuideSection[]>([])

  // データ読み込み
  useEffect(() => {
    const stored = LocalStorageService.get<SportGuide[]>(STORAGE_KEY) || []
    setGuides(stored)
  }, [])

  const saveGuides = (updated: SportGuide[]) => {
    setGuides(updated)
    LocalStorageService.set(STORAGE_KEY, updated)
  }

  // 新規作成を開く
  const openNewDialog = () => {
    setEditingGuide(null)
    setFormSport('')
    setFormCategory('')
    setFormTitle('')
    setFormSections([{ id: `s-${Date.now()}`, title: '', content: '', order: 0 }])
    setShowDialog(true)
  }

  // 編集を開く
  const openEditDialog = (guide: SportGuide) => {
    setEditingGuide(guide)
    setFormSport(guide.sport)
    setFormCategory(guide.category)
    setFormTitle(guide.title)
    setFormSections([...guide.sections])
    setShowDialog(true)
  }

  // セクション追加
  const addSection = () => {
    setFormSections(prev => [...prev, {
      id: `s-${Date.now()}-${prev.length}`,
      title: '',
      content: '',
      order: prev.length,
    }])
  }

  // セクション削除
  const removeSection = (index: number) => {
    if (formSections.length > 1) {
      setFormSections(prev => prev.filter((_, i) => i !== index))
    }
  }

  // セクション更新
  const updateSection = (index: number, field: keyof GuideSection, value: string) => {
    setFormSections(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // 保存
  const handleSave = () => {
    if (!formSport || !formTitle) {
      alert('スポーツとタイトルを入力してください')
      return
    }

    const now = new Date().toISOString()

    if (editingGuide) {
      // 更新
      const updated = guides.map(g =>
        g.id === editingGuide.id
          ? { ...g, sport: formSport, category: formCategory, title: formTitle, sections: formSections, updated_at: now }
          : g
      )
      saveGuides(updated)
    } else {
      // 新規
      const newGuide: SportGuide = {
        id: `guide-${Date.now()}`,
        sport: formSport,
        category: formCategory,
        title: formTitle,
        sections: formSections,
        created_at: now,
        updated_at: now,
      }
      saveGuides([...guides, newGuide])
    }

    setShowDialog(false)
  }

  // 削除
  const handleDelete = (id: string) => {
    if (confirm('この教材を削除しますか？')) {
      saveGuides(guides.filter(g => g.id !== id))
    }
  }

  // フィルタリング
  const filteredGuides = selectedSport === 'all'
    ? guides
    : guides.filter(g => g.sport === selectedSport)

  // スポーツ別にグループ化
  const groupedGuides = filteredGuides.reduce<Record<string, SportGuide[]>>((acc, guide) => {
    if (!acc[guide.sport]) acc[guide.sport] = []
    acc[guide.sport].push(guide)
    return acc
  }, {})

  const getSportInfo = (sport: string) => SPORT_OPTIONS.find(s => s.value === sport)

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">スポーツ教材ガイド</h1>
          <p className="text-muted-foreground mt-1">
            各スポーツの基礎知識・技術・ルールをまとめた参考資料
          </p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          新規教材を作成
        </Button>
      </div>

      {/* フィルター */}
      <div className="flex gap-3">
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全スポーツ</SelectItem>
            {SPORT_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.icon} {s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground flex items-center">
          {filteredGuides.length}件の教材
        </div>
      </div>

      {/* 教材一覧 */}
      {Object.keys(groupedGuides).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">教材がまだ登録されていません</p>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              最初の教材を作成
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedGuides).map(([sport, sportGuides]) => {
          const info = getSportInfo(sport)
          return (
            <div key={sport} className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">{info?.icon}</span>
                {info?.label || sport}
                <Badge variant="secondary">{sportGuides.length}件</Badge>
              </h2>

              {sportGuides.map(guide => {
                const isExpanded = expandedGuide === guide.id
                return (
                  <Card key={guide.id} className="overflow-hidden">
                    <div
                      className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <div>
                          <div className="font-medium">{guide.title}</div>
                          {guide.category && (
                            <Badge variant="outline" className="text-xs mt-1">{guide.category}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(guide)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(guide.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* 展開時: セクション表示 */}
                    {isExpanded && (
                      <CardContent className="border-t pt-6 space-y-6">
                        {guide.sections.map((section, i) => (
                          <div key={section.id || i} className="space-y-3">
                            {section.title && (
                              <h3 className="font-semibold text-lg border-l-4 border-blue-500 pl-3">
                                {section.title}
                              </h3>
                            )}

                            {section.imageUrl && (
                              <div className="space-y-1">
                                <img
                                  src={isGoogleDriveUrl(section.imageUrl) ? convertGoogleDriveImageUrl(section.imageUrl, 'l') : section.imageUrl}
                                  alt={section.imageCaption || section.title || '教材画像'}
                                  className="max-w-full max-h-96 rounded-lg border object-contain"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />
                                {section.imageCaption && (
                                  <p className="text-xs text-muted-foreground italic">{section.imageCaption}</p>
                                )}
                              </div>
                            )}

                            {section.content && (
                              <div className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                {section.content}
                              </div>
                            )}

                            {i < guide.sections.length - 1 && <hr className="my-4" />}
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )
        })
      )}

      {/* 新規作成・編集ダイアログ */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGuide ? '教材を編集' : '新規教材を作成'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 基本情報 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>スポーツ *</Label>
                <Select value={formSport} onValueChange={setFormSport}>
                  <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                  <SelectContent>
                    {SPORT_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.icon} {s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>カテゴリ</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>タイトル *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="例: 投球の基本フォーム"
              />
            </div>

            {/* セクション */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">内容セクション</Label>

              {formSections.map((section, index) => (
                <div key={section.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">セクション {index + 1}</Label>
                    {formSections.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeSection(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <Input
                    placeholder="見出し（例: 基本ルール、正しいフォーム）"
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                  />

                  <Textarea
                    placeholder="説明文を入力..."
                    value={section.content}
                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                    rows={4}
                  />

                  {/* 画像選択 */}
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      画像（任意）
                    </Label>
                    <GoogleDrivePicker
                      value={section.imageUrl}
                      onChange={(url) => updateSection(index, 'imageUrl', url)}
                      label="Google Driveから画像を選択"
                    />
                    {section.imageUrl && (
                      <Input
                        placeholder="画像のキャプション（任意）"
                        value={section.imageCaption || ''}
                        onChange={(e) => updateSection(index, 'imageCaption', e.target.value)}
                        className="text-sm"
                      />
                    )}
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                セクションを追加
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>キャンセル</Button>
            <Button onClick={handleSave}>{editingGuide ? '更新' : '作成'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
