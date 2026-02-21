'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useStudents } from '@/hooks/use-students'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import { CreateStudentRequest } from '@/types/student'

export default function NewStudentPage() {
  const router = useRouter()
  const { createStudent } = useStudents()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tStudents = useTranslations('students')
  const tCommon = useTranslations('common')

  const [formData, setFormData] = useState<CreateStudentRequest>({
    name: '',
    name_kana: '',
    name_en: '',
    birth_date: '',
    gender: 'male',
    enrollment_date: new Date().toISOString().split('T')[0],
    school: 'ageo',
    class_type: 'preschool',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    line_id: '',
    emergency_contact: '',
    medical_notes: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createStudent(formData)
      router.push('/students')
    } catch (err) {
      setError(err instanceof Error ? err.message : tStudents('newStudent.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 年齢計算
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const birth = new Date(birthDate)
    const today = new Date()
    return Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  // 推奨レベル計算
  const getRecommendedLevel = (birthDate: string) => {
    const age = calculateAge(birthDate)
    if (age >= 3 && age < 4) return 1
    if (age >= 4 && age < 5) return 2
    if (age >= 5 && age < 6) return 3
    if (age >= 6 && age < 7) return 4
    if (age >= 7) return 5
    return 1
  }

  const age = calculateAge(formData.birth_date)
  const recommendedLevel = getRecommendedLevel(formData.birth_date)

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tStudents('newStudent.title')}</h1>
          <p className="text-muted-foreground">
            {tStudents('newStudent.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>{tStudents('newStudent.basicInfo')}</CardTitle>
              <CardDescription>
                {tStudents('newStudent.basicInfoDesc')}
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
                  <Label htmlFor="name">{tStudents('form.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="田中 太郎"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_kana">{tStudents('form.nameKana')}</Label>
                  <Input
                    id="name_kana"
                    value={formData.name_kana}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_kana: e.target.value }))}
                    placeholder="たなか たろう"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_en">{tStudents('form.nameEn')}</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="Taro Tanaka"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">{tStudents('form.birthDate')} *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    required
                  />
                  {formData.birth_date && (
                    <p className="text-sm text-muted-foreground">
                      {tStudents('newStudent.currentAge')}: {age}{tStudents('newStudent.yearsOld')}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{tStudents('form.gender')} *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'male' | 'female' | 'other') =>
                      setFormData(prev => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tStudents('form.selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{tStudents('form.male')}</SelectItem>
                      <SelectItem value="female">{tStudents('form.female')}</SelectItem>
                      <SelectItem value="other">{tStudents('form.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollment_date">{tStudents('form.enrollmentDate')} *</Label>
                  <Input
                    id="enrollment_date"
                    type="date"
                    value={formData.enrollment_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, enrollment_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* レベル推奨表示 */}
              {formData.birth_date && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {tStudents('newStudent.recommendedLevel')}（{age}{tStudents('newStudent.yearsOld')}）: Lv{recommendedLevel}
                    {tStudents('newStudent.autoSet')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 校舎・クラス情報 */}
          <Card>
            <CardHeader>
              <CardTitle>{tStudents('newStudent.schoolClassInfo')}</CardTitle>
              <CardDescription>
                {tStudents('newStudent.schoolClassInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school">{tStudents('filters.school')} *</Label>
                  <Select
                    value={formData.school}
                    onValueChange={(value: 'ageo' | 'okegawa') =>
                      setFormData(prev => ({ ...prev, school: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tStudents('form.selectSchool')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageo">{tStudents('filters.ageo')}</SelectItem>
                      <SelectItem value="okegawa">{tStudents('filters.okegawa')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_type">{tStudents('filters.classType')} *</Label>
                  <Select
                    value={formData.class_type}
                    onValueChange={(value: 'preschool' | 'elementary') =>
                      setFormData(prev => ({ ...prev, class_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tStudents('form.selectClassType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">{tStudents('filters.preschool')}</SelectItem>
                      <SelectItem value="elementary">{tStudents('filters.elementary')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保護者情報 */}
          <Card>
            <CardHeader>
              <CardTitle>{tStudents('newStudent.parentInfo')}</CardTitle>
              <CardDescription>
                {tStudents('newStudent.parentInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">{tStudents('form.parentName')} *</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_name: e.target.value }))}
                  placeholder="田中 花子"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parent_email">{tStudents('form.parentEmail')}</Label>
                  <Input
                    id="parent_email"
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_email: e.target.value }))}
                    placeholder="parent@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_phone">{tStudents('form.parentPhone')}</Label>
                  <Input
                    id="parent_phone"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_phone: e.target.value }))}
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="line_id">LINE ID</Label>
                  <Input
                    id="line_id"
                    value={formData.line_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, line_id: e.target.value }))}
                    placeholder="line_id_example"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">{tStudents('form.emergencyContact')}</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    placeholder="080-9876-5432"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* その他情報 */}
          <Card>
            <CardHeader>
              <CardTitle>{tStudents('newStudent.otherInfo')}</CardTitle>
              <CardDescription>
                {tStudents('newStudent.otherInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medical_notes">{tStudents('newStudent.medicalAllergy')}</Label>
                <Textarea
                  id="medical_notes"
                  value={formData.medical_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, medical_notes: e.target.value }))}
                  placeholder={tStudents('newStudent.medicalPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{tStudents('newStudent.otherNotes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={tStudents('newStudent.otherNotesPlaceholder')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end">
            <Link href="/students">
              <Button type="button" variant="outline">
                {tCommon('cancel')}
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? tStudents('newStudent.registering') : tStudents('newStudent.registerStudent')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}