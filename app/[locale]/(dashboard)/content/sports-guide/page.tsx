'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  category: string
  title: string
  sections: GuideSection[]
  created_at: string
  updated_at: string
}

const STORAGE_KEY = 'sports_guides'

const SPORT_KEYS = [
  { value: 'volleyball', icon: '🏐' },
  { value: 'basketball', icon: '🏀' },
  { value: 'soccer', icon: '⚽' },
  { value: 'tennis', icon: '🎾' },
  { value: 'tag_rugby', icon: '🏉' },
  { value: 'baseball', icon: '⚾' },
  { value: 'badminton', icon: '🏸' },
  { value: 'dance', icon: '💃' },
]

const CATEGORY_KEYS = [
  'categoryRules',
  'categoryBasics',
  'categoryForm',
  'categoryNG',
  'categoryDrill',
  'categoryTeaching',
  'categorySafety',
]

// sport value -> translation key mapping
const SPORT_LABEL_KEYS: Record<string, string> = {
  volleyball: 'volleyball',
  basketball: 'basketball',
  soccer: 'soccer',
  tennis: 'tennis',
  tag_rugby: 'tagRugby',
  baseball: 'baseball',
  badminton: 'badminton',
  dance: 'dance',
}

export default function SportsGuidePage() {
  const t = useTranslations('sportsGuide')
  const [guides, setGuides] = useState<SportGuide[]>([])
  const [selectedSport, setSelectedSport] = useState<string>('all')
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)

  const [showDialog, setShowDialog] = useState(false)
  const [editingGuide, setEditingGuide] = useState<SportGuide | null>(null)
  const [formSport, setFormSport] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formSections, setFormSections] = useState<GuideSection[]>([])

  useEffect(() => {
    const stored = LocalStorageService.get<SportGuide[]>(STORAGE_KEY) || []
    setGuides(stored)
  }, [])

  const saveGuides = (updated: SportGuide[]) => {
    setGuides(updated)
    LocalStorageService.set(STORAGE_KEY, updated)
  }

  const getSportLabel = (sport: string) => {
    const key = SPORT_LABEL_KEYS[sport]
    return key ? t(key) : sport
  }

  const getSportIcon = (sport: string) => SPORT_KEYS.find(s => s.value === sport)?.icon || '🏃'

  const openNewDialog = () => {
    setEditingGuide(null)
    setFormSport('')
    setFormCategory('')
    setFormTitle('')
    setFormSections([{ id: `s-${Date.now()}`, title: '', content: '', order: 0 }])
    setShowDialog(true)
  }

  const openEditDialog = (guide: SportGuide) => {
    setEditingGuide(guide)
    setFormSport(guide.sport)
    setFormCategory(guide.category)
    setFormTitle(guide.title)
    setFormSections([...guide.sections])
    setShowDialog(true)
  }

  const addSection = () => {
    setFormSections(prev => [...prev, {
      id: `s-${Date.now()}-${prev.length}`,
      title: '',
      content: '',
      order: prev.length,
    }])
  }

  const removeSection = (index: number) => {
    if (formSections.length > 1) {
      setFormSections(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateSection = (index: number, field: keyof GuideSection, value: string) => {
    setFormSections(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSave = () => {
    if (!formSport || !formTitle) {
      alert(t('sportRequired'))
      return
    }

    const now = new Date().toISOString()

    if (editingGuide) {
      const updated = guides.map(g =>
        g.id === editingGuide.id
          ? { ...g, sport: formSport, category: formCategory, title: formTitle, sections: formSections, updated_at: now }
          : g
      )
      saveGuides(updated)
    } else {
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

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      saveGuides(guides.filter(g => g.id !== id))
    }
  }

  const filteredGuides = selectedSport === 'all'
    ? guides
    : guides.filter(g => g.sport === selectedSport)

  const groupedGuides = filteredGuides.reduce<Record<string, SportGuide[]>>((acc, guide) => {
    if (!acc[guide.sport]) acc[guide.sport] = []
    acc[guide.sport].push(guide)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createNew')}
        </Button>
      </div>

      {/* フィルター */}
      <div className="flex gap-3">
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allSports')}</SelectItem>
            {SPORT_KEYS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.icon} {getSportLabel(s.value)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground flex items-center">
          {filteredGuides.length}{t('guidesCount')}
        </div>
      </div>

      {/* 教材一覧 */}
      {Object.keys(groupedGuides).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">{t('noGuides')}</p>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t('createFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedGuides).map(([sport, sportGuides]) => (
          <div key={sport} className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">{getSportIcon(sport)}</span>
              {getSportLabel(sport)}
              <Badge variant="secondary">{sportGuides.length}</Badge>
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
                                alt={section.imageCaption || section.title || ''}
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
        ))
      )}

      {/* 新規作成・編集ダイアログ */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGuide ? t('editGuide') : t('createGuide')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('sport')} *</Label>
                <Select value={formSport} onValueChange={setFormSport}>
                  <SelectTrigger><SelectValue placeholder={t('selectSport')} /></SelectTrigger>
                  <SelectContent>
                    {SPORT_KEYS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.icon} {getSportLabel(s.value)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('category')}</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_KEYS.map(key => (
                      <SelectItem key={key} value={t(key)}>{t(key)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t('guideTitle')} *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={t('titlePlaceholder')}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">{t('sections')}</Label>

              {formSections.map((section, index) => (
                <div key={section.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{t('sectionLabel')} {index + 1}</Label>
                    {formSections.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeSection(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <Input
                    placeholder={t('headingPlaceholder')}
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                  />

                  <Textarea
                    placeholder={t('descriptionPlaceholder')}
                    value={section.content}
                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                    rows={4}
                  />

                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {t('image')}
                    </Label>
                    <GoogleDrivePicker
                      value={section.imageUrl}
                      onChange={(url) => updateSection(index, 'imageUrl', url)}
                      label={t('selectImage')}
                    />
                    {section.imageUrl && (
                      <Input
                        placeholder={t('captionPlaceholder')}
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
                {t('addSection')}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{editingGuide ? t('update') : t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
