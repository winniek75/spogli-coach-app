'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCoach, useCoaches } from '@/hooks/use-coaches'
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
import { ArrowLeft, Loader2, Save, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { UpdateCoachRequest } from '@/types/coach'

export default function EditCoachPage() {
  const params = useParams()
  const router = useRouter()
  const coachId = params.id as string
  const { coach, loading: loadingCoach, error: fetchError } = useCoach(coachId)
  const { updateCoach } = useCoaches()
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<UpdateCoachRequest>({
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
    status: 'active',
  })

  // 講師データが読み込まれたらフォームに反映
  useEffect(() => {
    if (coach) {
      setFormData({
        name: coach.name || '',
        name_en: coach.name_en || '',
        email: coach.email || '',
        phone: coach.phone || '',
        line_id: coach.line_id || '',
        nationality: coach.nationality || '',
        languages: coach.languages || [],
        role: coach.role || 'coach',
        schools: coach.schools || [],
        hire_date: coach.hire_date ? coach.hire_date.split('T')[0] : '',
        notes: coach.notes || '',
        status: coach.status || 'active',
      })
    }
  }, [coach])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await updateCoach(coachId, formData)
      router.push(`/coaches/${coachId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '講師情報の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages: checked
        ? [...(prev.languages || []), language]
        : (prev.languages || []).filter(l => l !== language)
    }))
  }

  const handleSchoolChange = (school: 'ageo' | 'okegawa', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      schools: checked
        ? [...(prev.schools || []), school]
        : (prev.schools || []).filter(s => s !== school)
    }))
  }

  const availableLanguages = ['日本語', '英語', 'フィリピン語', '中国語', '韓国語', 'スペイン語']

  if (loadingCoach) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">講師情報を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (fetchError || !coach) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{fetchError || '講師が見つかりません'}</p>
          <Link href="/coaches">
            <Button>講師一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href={`/coaches/${coachId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">講師情報編集</h1>
          <p className="text-muted-foreground">
            {coach.name}の情報を編集します
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
                講師の基本的な個人情報を編集してください
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
                  <Label htmlFor="name_en">英語名</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="Taro Tanaka"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス *</Label>
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
                  <Label htmlFor="phone">電話番号</Label>
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
                <Label htmlFor="nationality">国籍</Label>
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
              <CardTitle>職務情報</CardTitle>
              <CardDescription>
                講師の役職、担当校舎、入社日などを設定してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">役職</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'coach' | 'senior_coach' | 'manager') =>
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="役職を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach">講師</SelectItem>
                      <SelectItem value="senior_coach">シニア講師</SelectItem>
                      <SelectItem value="manager">マネージャー</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">ステータス</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') =>
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">在職中</SelectItem>
                      <SelectItem value="inactive">退職</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>担当校舎 *</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ageo"
                      checked={formData.schools?.includes('ageo')}
                      onCheckedChange={(checked: boolean) => handleSchoolChange('ageo', checked)}
                    />
                    <Label htmlFor="ageo">上尾校</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="okegawa"
                      checked={formData.schools?.includes('okegawa')}
                      onCheckedChange={(checked: boolean) => handleSchoolChange('okegawa', checked)}
                    />
                    <Label htmlFor="okegawa">桶川校</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">入社日</Label>
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
              <CardTitle>言語・スキル</CardTitle>
              <CardDescription>
                講師が話せる言語を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>対応可能言語</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableLanguages.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={language}
                        checked={formData.languages?.includes(language)}
                        onCheckedChange={(checked: boolean) => handleLanguageChange(language, checked)}
                      />
                      <Label htmlFor={language}>{language}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* その他情報 */}
          <Card>
            <CardHeader>
              <CardTitle>その他情報</CardTitle>
              <CardDescription>
                追加の情報やメモがあれば入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="追加の情報やメモ..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end">
            <Link href={`/coaches/${coachId}`}>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : '変更を保存'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
