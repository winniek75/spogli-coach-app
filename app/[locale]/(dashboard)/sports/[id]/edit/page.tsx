'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
} from 'lucide-react'
import { SPORT_CATEGORIES } from '@/types/sport'

export default function EditSportPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const sportId = params.id as string
  const t = useTranslations('schedule.sports')

  // Demo data - in production, this would come from an API
  const [formData, setFormData] = useState({
    code: 'volleyball',
    name: 'バレーボール',
    name_en: 'Volleyball',
    icon: '🏐',
    color: '#4F46E5',
    description: 'チームワークと基本的なボールハンドリングスキルを身につけます',
    description_en: 'Develop teamwork and basic ball handling skills',
    category_id: 'ball',
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
  })

  const [newObjective, setNewObjective] = useState({ name: '', level: 1 })
  const [newSkill, setNewSkill] = useState({ name: '', category: 'basic' })
  const [newLevel, setNewLevel] = useState({ level: 1, name: '' })
  const [newEquipment, setNewEquipment] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSaving(false)
    router.push(`/${locale}/sports/${sportId}`)
  }

  const addObjective = () => {
    if (newObjective.name) {
      setFormData({
        ...formData,
        objectives: [...formData.objectives, { ...newObjective, id: Date.now().toString() }]
      })
      setNewObjective({ name: '', level: 1 })
    }
  }

  const removeObjective = (id: string) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.filter(o => o.id !== id)
    })
  }

  const addSkill = () => {
    if (newSkill.name) {
      setFormData({
        ...formData,
        skills: [...formData.skills, { ...newSkill, id: Date.now().toString() }]
      })
      setNewSkill({ name: '', category: 'basic' })
    }
  }

  const removeSkill = (id: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s.id !== id)
    })
  }

  const addLevel = () => {
    if (newLevel.name) {
      setFormData({
        ...formData,
        levels: [...formData.levels, { ...newLevel, id: Date.now().toString() }]
      })
      setNewLevel({ level: 1, name: '' })
    }
  }

  const removeLevel = (id: string) => {
    setFormData({
      ...formData,
      levels: formData.levels.filter(l => l.id !== id)
    })
  }

  const addEquipment = () => {
    if (newEquipment && !formData.equipment.includes(newEquipment)) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, newEquipment]
      })
      setNewEquipment('')
    }
  }

  const removeEquipment = (item: string) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter(e => e !== item)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/sports/${sportId}`}>
            <Button type="button" variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('editSport')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('editSportDescription')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/sports/${sportId}`}>
            <Button type="button" variant="outline">
              <X className="h-4 w-4 mr-2" />
              {t('cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInfo')}</CardTitle>
              <CardDescription>{t('basicInfoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="code">{t('sportCode')}</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="volleyball"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">{t('category')}</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORT_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">{t('sportNameJa')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="バレーボール"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_en">{t('sportNameEn')}</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Volleyball"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('descriptionJa')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('sportDescriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description_en">{t('descriptionEn')}</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder={t('sportDescriptionEnPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="icon">{t('icon')}</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🏐"
                  />
                </div>
                <div>
                  <Label htmlFor="color">{t('color')}</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">{t('isActive')}</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>{t('objectives')}</CardTitle>
              <CardDescription>{t('objectivesEditDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.objectives.map((objective) => (
                  <div key={objective.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{objective.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t('level')} {objective.level}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObjective(objective.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newObjective.name}
                  onChange={(e) => setNewObjective({ ...newObjective, name: e.target.value })}
                  placeholder={t('newObjectivePlaceholder')}
                  className="flex-1"
                />
                <Select
                  value={newObjective.level.toString()}
                  onValueChange={(value) => setNewObjective({ ...newObjective, level: parseInt(value) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        {t('level')} {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addObjective}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>{t('skills')}</CardTitle>
              <CardDescription>{t('skillsEditDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{skill.category}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder={t('newSkillPlaceholder')}
                  className="flex-1"
                />
                <Select
                  value={newSkill.category}
                  onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">{t('basic')}</SelectItem>
                    <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('advanced')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Equipment */}
          <Card>
            <CardHeader>
              <CardTitle>{t('equipment')}</CardTitle>
              <CardDescription>{t('equipmentEditDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.equipment.map((item) => (
                  <div key={item} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEquipment(item)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder={t('newEquipmentPlaceholder')}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                />
                <Button type="button" onClick={addEquipment}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Levels */}
          <Card>
            <CardHeader>
              <CardTitle>{t('levels')}</CardTitle>
              <CardDescription>{t('levelsEditDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.levels.map((level) => (
                  <div key={level.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t('level')} {level.level}</Badge>
                      <span className="text-sm">{level.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(level.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select
                    value={newLevel.level.toString()}
                    onValueChange={(value) => setNewLevel({ ...newLevel, level: parseInt(value) })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          {t('level')} {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newLevel.name}
                    onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                    placeholder={t('levelNamePlaceholder')}
                    className="flex-1"
                  />
                </div>
                <Button type="button" onClick={addLevel} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addLevel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}