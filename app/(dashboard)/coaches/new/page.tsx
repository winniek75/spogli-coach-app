'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      setError(err instanceof Error ? err.message : '講師の作成に失敗しました')
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

  const availableLanguages = ['日本語', '英語', 'フィリピン語', '中国語', '韓国語', 'スペイン語']

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
          <h1 className="text-3xl font-bold tracking-tight">新規講師登録</h1>
          <p className="text-muted-foreground">
            新しい講師の情報を入力してください
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
                講師の基本的な個人情報を入力してください
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
                <Label>担当校舎 *</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ageo"
                      checked={formData.schools.includes('ageo')}
                      onCheckedChange={(checked: boolean) => handleSchoolChange('ageo', checked)}
                    />
                    <Label htmlFor="ageo">上尾校</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="okegawa"
                      checked={formData.schools.includes('okegawa')}
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
                        checked={formData.languages.includes(language)}
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
            <Link href="/coaches">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? '登録中...' : '講師を登録'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}