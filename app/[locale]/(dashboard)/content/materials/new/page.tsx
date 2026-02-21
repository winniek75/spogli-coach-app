'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { usePDFMaterials } from '@/hooks/use-pdf-materials'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
import { ArrowLeft, Upload, FileText, Info } from 'lucide-react'
import Link from 'next/link'
import { CONTENT_CATEGORIES, PDF_PURPOSES } from '@/types/content'

export default function NewMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'ja'
  const { uploadPDFMaterial } = usePDFMaterials()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    category: '',
    purpose: '',
    level: '1',
    file: null as File | null,
    thumbnail: null as File | null,
    tags: '',
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumbnail') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, [type]: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.file) {
      setUploadError('PDF ファイルを選択してください')
      return
    }

    if (!formData.title.trim()) {
      setUploadError('タイトルを入力してください')
      return
    }

    if (!formData.sport) {
      setUploadError('スポーツを選択してください')
      return
    }

    if (!formData.category) {
      setUploadError('カテゴリを選択してください')
      return
    }

    if (!formData.purpose) {
      setUploadError('用途を選択してください')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      // プログレスバーのシミュレーション
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // 実際のアップロード処理（デモモードではローカルストレージに保存）
      await uploadPDFMaterial({
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        category: formData.category,
        purpose: formData.purpose,
        level: parseInt(formData.level),
        file_size: formData.file.size,
        file_url: URL.createObjectURL(formData.file),
        thumbnail_url: formData.thumbnail ? URL.createObjectURL(formData.thumbnail) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      })

      // アップロード完了
      clearInterval(progressInterval)
      setUploadProgress(100)

      // 成功後、一覧ページへ遷移
      setTimeout(() => {
        router.push(`/${locale}/content/materials`)
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : '教材のアップロードに失敗しました')
      setIsUploading(false)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/content/materials`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">教材をアップロード</h1>
          <p className="text-muted-foreground mt-2">
            新しい教材をライブラリに追加します
          </p>
        </div>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>教材の基本的な情報を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="例: 練習メニュー計画書"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="教材の内容を説明してください"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">スポーツ *</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
                  >
                    <SelectTrigger id="sport">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volleyball">バレーボール</SelectItem>
                      <SelectItem value="basketball">バスケットボール</SelectItem>
                      <SelectItem value="soccer">サッカー</SelectItem>
                      <SelectItem value="tennis">テニス</SelectItem>
                      <SelectItem value="baseball">野球</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONTENT_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purpose">用途 *</Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
                  >
                    <SelectTrigger id="purpose">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PDF_PURPOSES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">レベル</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">レベル 1</SelectItem>
                      <SelectItem value="2">レベル 2</SelectItem>
                      <SelectItem value="3">レベル 3</SelectItem>
                      <SelectItem value="4">レベル 4</SelectItem>
                      <SelectItem value="5">レベル 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">タグ（カンマ区切り）</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="例: 練習メニュー, 初心者向け, チーム練習"
                />
              </div>
            </CardContent>
          </Card>

          {/* ファイルアップロード */}
          <Card>
            <CardHeader>
              <CardTitle>ファイル</CardTitle>
              <CardDescription>PDFファイルとサムネイル画像をアップロード</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-file">PDFファイル *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <input
                    id="pdf-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleFileChange(e, 'file')}
                    className="hidden"
                  />
                  <Label
                    htmlFor="pdf-file"
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    {formData.file ? (
                      <div>
                        <p className="font-medium text-foreground">{formData.file.name}</p>
                        <p className="text-xs mt-1">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        クリックしてPDFを選択
                        <br />
                        <span className="text-xs">PDF (最大 50MB)</span>
                      </>
                    )}
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">サムネイル画像</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    className="hidden"
                  />
                  <Label
                    htmlFor="thumbnail"
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    {formData.thumbnail ? (
                      <div>
                        <p className="font-medium text-foreground">{formData.thumbnail.name}</p>
                        <p className="text-xs mt-1">
                          {(formData.thumbnail.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        クリックして画像を選択
                        <br />
                        <span className="text-xs">JPG, PNG (推奨: 1280x720)</span>
                      </>
                    )}
                  </Label>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>アップロード中...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  PDFファイルは圧縮され、最適化された形式で保存されます。
                  大きなファイルの場合、アップロードに時間がかかることがあります。
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex justify-end gap-4">
              <Link href={`/${locale}/content/materials`}>
                <Button variant="outline" type="button">
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    アップロード
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}