'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStudent, useStudents } from '@/hooks/use-students'
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
import { ArrowLeft, Loader2, Info, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { UpdateStudentRequest } from '@/types/student'

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const { student, loading: fetchLoading, error: fetchError } = useStudent(studentId)
  const { updateStudent } = useStudents()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<UpdateStudentRequest>({
    name: student?.name || '',
    name_kana: student?.name_kana || '',
    name_en: student?.name_en || '',
    birth_date: student?.birth_date || '',
    gender: student?.gender || 'male',
    school: student?.school || 'ageo',
    class_type: student?.class_type || 'preschool',
    level: student?.level || 1,
    status: student?.status || 'active',
    parent_name: student?.parent_name || '',
    parent_email: student?.parent_email || '',
    parent_phone: student?.parent_phone || '',
    line_id: student?.line_id || '',
    emergency_contact: student?.emergency_contact || '',
    medical_notes: student?.medical_notes || '',
    notes: student?.notes || '',
    photo_url: student?.photo_url || '',
  })

  // フォームデータを学生データで初期化
  useState(() => {
    if (student && Object.keys(formData).every(key => !formData[key as keyof UpdateStudentRequest])) {
      setFormData({
        name: student.name || '',
        name_kana: student.name_kana || '',
        name_en: student.name_en || '',
        birth_date: student.birth_date || '',
        gender: student.gender || 'male',
        school: student.school || 'ageo',
        class_type: student.class_type || 'preschool',
        level: student.level || 1,
        status: student.status || 'active',
        parent_name: student.parent_name || '',
        parent_email: student.parent_email || '',
        parent_phone: student.parent_phone || '',
        line_id: student.line_id || '',
        emergency_contact: student.emergency_contact || '',
        medical_notes: student.medical_notes || '',
        notes: student.notes || '',
        photo_url: student.photo_url || '',
      })
    }
  }, [student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateStudent(studentId, formData)
      setSuccess(true)
      setTimeout(() => {
        router.push(`/students/${studentId}`)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生徒情報の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const birth = new Date(birthDate)
    const today = new Date()
    return Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const age = calculateAge(formData.birth_date)

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">生徒データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{fetchError}</p>
          <Link href="/students">
            <Button>生徒一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            生徒が見つかりません
          </p>
          <Link href="/students">
            <Button>生徒一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href={`/students/${studentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">生徒情報編集</h1>
          <p className="text-muted-foreground">
            {student.name}さんの情報を編集
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
                生徒の基本的な個人情報を編集してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    生徒情報を更新しました。詳細ページに戻ります...
                  </AlertDescription>
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
                  <Label htmlFor="photo_url">プロフィール画像URL</Label>
                  <Input
                    id="photo_url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 校舎・クラス・レベル情報 */}
          <Card>
            <CardHeader>
              <CardTitle>校舎・クラス・レベル情報</CardTitle>
              <CardDescription>
                所属情報とレベルを設定してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
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
                <div className="space-y-2">
                  <Label htmlFor="level">レベル *</Label>
                  <Select
                    value={formData.level?.toString() || '1'}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, level: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="レベルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Lv1: Rookie</SelectItem>
                      <SelectItem value="2">Lv2: Challenger</SelectItem>
                      <SelectItem value="3">Lv3: Adventurer</SelectItem>
                      <SelectItem value="4">Lv4: Explorer</SelectItem>
                      <SelectItem value="5">Lv5: Champion</SelectItem>
                      <SelectItem value="6">Lv6: Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">ステータス *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive' | 'withdrawn') =>
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">在籍中</SelectItem>
                      <SelectItem value="inactive">休会</SelectItem>
                      <SelectItem value="withdrawn">退会</SelectItem>
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
                保護者の連絡先情報を編集してください
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
                医療情報や特記事項を編集してください
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
            <Link href={`/students/${studentId}`}>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? '更新中...' : '情報を更新'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}