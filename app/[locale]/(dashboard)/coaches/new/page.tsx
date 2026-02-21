'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCoaches } from '@/hooks/use-coaches'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CreateCoachRequest } from '@/types/coach'

export default function NewCoachPage() {
  const router = useRouter()
  const { createCoach } = useCoaches()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tCoaches = useTranslations('coaches')
  const tCommon = useTranslations('common')

  const [formData, setFormData] = useState<CreateCoachRequest>({
    name: '',
    name_en: '',
    email: '',
    phone: '',
    line_id: '',
    nationality: '',
    languages: [],
    role: 'coach',
    schools: [],
    hire_date: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createCoach(formData)
      router.push('/coaches')
    } catch (err) {
      setError(err instanceof Error ? err.message : tCoaches('newCoach.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages: checked
        ? [...prev.languages, language]
        : prev.languages.filter(l => l !== language)
    }))
  }

  const handleSchoolChange = (school: 'ageo' | 'okegawa', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      schools: checked
        ? [...prev.schools, school]
        : prev.schools.filter(s => s !== school)
    }))
  }

  const availableLanguages = [
    { key: 'japanese', label: tCoaches('newCoach.japanese') },
    { key: 'english', label: tCoaches('newCoach.english') },
    { key: 'filipino', label: tCoaches('newCoach.filipino') },
    { key: 'chinese', label: tCoaches('newCoach.chinese') },
    { key: 'korean', label: tCoaches('newCoach.korean') },
    { key: 'spanish', label: tCoaches('newCoach.spanish') }
  ]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/coaches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tCoaches('newCoach.title')}</h1>
          <p className="text-muted-foreground">
            {tCoaches('newCoach.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>{tCoaches('newCoach.basicInfo')}</CardTitle>
              <CardDescription>
                {tCoaches('newCoach.basicInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{tCoaches('newCoach.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="田中 太郎"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">{tCoaches('newCoach.nameEn')}</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="Taro Tanaka"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{tCoaches('newCoach.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tanaka@example.com"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">{tCoaches('newCoach.phone')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="090-1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line_id">LINE ID</Label>
                  <Input
                    id="line_id"
                    value={formData.line_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, line_id: e.target.value }))}
                    placeholder="line_id_example"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">{tCoaches('newCoach.nationality')}</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                  placeholder="日本"
                />
              </div>
            </CardContent>
          </Card>

          {/* 職務情報 */}
          <Card>
            <CardHeader>
              <CardTitle>{tCoaches('newCoach.jobInfo')}</CardTitle>
              <CardDescription>
                {tCoaches('newCoach.jobInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">{tCoaches('newCoach.role')}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'coach' | 'senior_coach' | 'manager') =>
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tCoaches('newCoach.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coach">{tCoaches('newCoach.coach')}</SelectItem>
                    <SelectItem value="senior_coach">{tCoaches('newCoach.seniorCoach')}</SelectItem>
                    <SelectItem value="manager">{tCoaches('newCoach.manager')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{tCoaches('newCoach.assignedSchools')} *</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ageo"
                      checked={formData.schools.includes('ageo')}
                      onCheckedChange={(checked: boolean) => handleSchoolChange('ageo', checked)}
                    />
                    <Label htmlFor="ageo">{tCoaches('filters.school')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="okegawa"
                      checked={formData.schools.includes('okegawa')}
                      onCheckedChange={(checked: boolean) => handleSchoolChange('okegawa', checked)}
                    />
                    <Label htmlFor="okegawa">{tCoaches('filters.okegawa')}</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">{tCoaches('newCoach.hireDate')}</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* 言語・スキル */}
          <Card>
            <CardHeader>
              <CardTitle>{tCoaches('newCoach.languageSkills')}</CardTitle>
              <CardDescription>
                {tCoaches('newCoach.languageSkillsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{tCoaches('newCoach.availableLanguages')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableLanguages.map((language) => (
                    <div key={language.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={language.key}
                        checked={formData.languages.includes(language.label)}
                        onCheckedChange={(checked: boolean) => handleLanguageChange(language.label, checked)}
                      />
                      <Label htmlFor={language.key}>{language.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* その他情報 */}
          <Card>
            <CardHeader>
              <CardTitle>{tCoaches('newCoach.otherInfo')}</CardTitle>
              <CardDescription>
                {tCoaches('newCoach.otherInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">{tCoaches('newCoach.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={tCoaches('newCoach.notesPlaceholder')}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end">
            <Link href="/coaches">
              <Button type="button" variant="outline">
                {tCommon('cancel')}
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? tCoaches('newCoach.registering') : tCoaches('newCoach.registerCoach')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}