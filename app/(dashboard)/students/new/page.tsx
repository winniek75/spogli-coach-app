'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      setError(err instanceof Error ? err.message : '生徒の登録に失敗しました')
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
          <h1 className="text-3xl font-bold tracking-tight">新規生徒登録</h1>
          <p className="text-muted-foreground">
            新しい生徒の情報を入力してください
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                生徒の基本的な個人情報を入力してください
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
                  <Label htmlFor="name">氏名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="田中 太郎"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_kana">ふりがな</Label>
                  <Input
                    id="name_kana"
                    value={formData.name_kana}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_kana: e.target.value }))}
                    placeholder="たなか たろう"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_en">英語名</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="Taro Tanaka"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">生年月日 *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    required
                  />
                  {formData.birth_date && (
                    <p className="text-sm text-muted-foreground">
                      現在の年齢: {age}歳
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">性別 *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'male' | 'female' | 'other') =>
                      setFormData(prev => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="性別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男性</SelectItem>
                      <SelectItem value="female">女性</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollment_date">入会日 *</Label>
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
                    年齢（{age}歳）に基づく推奨レベル: Lv{recommendedLevel}
                    （自動設定されます）
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 校舎・クラス情報 */}
          <Card>
            <CardHeader>
              <CardTitle>校舎・クラス情報</CardTitle>
              <CardDescription>
                所属する校舎とクラス種別を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school">校舎 *</Label>
                  <Select
                    value={formData.school}
                    onValueChange={(value: 'ageo' | 'okegawa') =>
                      setFormData(prev => ({ ...prev, school: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="校舎を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageo">上尾校</SelectItem>
                      <SelectItem value="okegawa">桶川校</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_type">クラス種別 *</Label>
                  <Select
                    value={formData.class_type}
                    onValueChange={(value: 'preschool' | 'elementary') =>
                      setFormData(prev => ({ ...prev, class_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="クラス種別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">未就学児</SelectItem>
                      <SelectItem value="elementary">小学生</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保護者情報 */}
          <Card>
            <CardHeader>
              <CardTitle>保護者情報</CardTitle>
              <CardDescription>
                保護者の連絡先情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">保護者氏名 *</Label>
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
                  <Label htmlFor="parent_email">メールアドレス</Label>
                  <Input
                    id="parent_email"
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_email: e.target.value }))}
                    placeholder="parent@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_phone">電話番号</Label>
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
                  <Label htmlFor="emergency_contact">緊急連絡先</Label>
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
              <CardTitle>その他情報</CardTitle>
              <CardDescription>
                医療情報や特記事項があれば入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medical_notes">医療情報・アレルギー等</Label>
                <Textarea
                  id="medical_notes"
                  value={formData.medical_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, medical_notes: e.target.value }))}
                  placeholder="アレルギー、既往症、服薬中の薬、注意事項など..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">その他メモ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="性格、特徴、保護者からの要望など..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end">
            <Link href="/students">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? '登録中...' : '生徒を登録'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}