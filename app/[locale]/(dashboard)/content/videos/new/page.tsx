'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useVideos } from '@/hooks/use-videos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Upload, Film, Info, Link as LinkIcon, HardDrive } from 'lucide-react'
import Link from 'next/link'
import { CONTENT_CATEGORIES } from '@/types/content'

export default function NewVideoPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'ja'
  const { uploadVideo } = useVideos()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadType, setUploadType] = useState<'file' | 'googledrive'>('googledrive')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    category: '',
    level: '1',
    duration_minutes: '',
    file: null as File | null,
    thumbnail: null as File | null,
    tags: '',
    googleDriveUrl: '',
  })

  // Google Drive URLを埋め込み用に変換
  const convertGoogleDriveUrl = (url: string): string => {
    // https://drive.google.com/file/d/FILE_ID/view -> https://drive.google.com/file/d/FILE_ID/preview
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (match) {
      const fileId = match[1]
      return `https://drive.google.com/file/d/${fileId}/preview`
    }
    return url
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumbnail') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, [type]: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (uploadType === 'file' && !formData.file) {
      setUploadError('動画ファイルを選択してください')
      return
    }

    if (uploadType === 'googledrive' && !formData.googleDriveUrl) {
      setUploadError('Google DriveのURLを入力してください')
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

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      // プログレスバーのシミュレーション
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      // 動画URLを決定
      let videoUrl = ''
      let fileSize = 0

      if (uploadType === 'googledrive') {
        videoUrl = convertGoogleDriveUrl(formData.googleDriveUrl)
        fileSize = 0 // Google Driveの場合はサイズ不明
      } else if (formData.file) {
        // 通常のファイルアップロード（現在は仮URL）
        videoUrl = URL.createObjectURL(formData.file)
        fileSize = formData.file.size
      }

      // API呼び出し
      await uploadVideo({
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        category: formData.category,
        level: parseInt(formData.level),
        duration_minutes: parseInt(formData.duration_minutes) || 0,
        file_size: fileSize,
        file_url: videoUrl,
        thumbnail_url: formData.thumbnail ? URL.createObjectURL(formData.thumbnail) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      })

      // アップロード完了
      clearInterval(progressInterval)
      setUploadProgress(100)

      // 成功後、一覧ページへ遷移
      setTimeout(() => {
        router.push(`/${locale}/content/videos`)
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : '動画のアップロードに失敗しました')
      setIsUploading(false)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/content/videos`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">動画を追加</h1>
          <p className="text-muted-foreground mt-2">
            レッスン動画をアップロードまたはGoogle Driveから連携
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>動画の基本的な情報を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="例: バレーボール アンダーハンドパス基礎"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="動画の内容を説明してください"
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
                      {Object.entries(CONTENT_CATEGORIES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="duration">再生時間（分）</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                    placeholder="例: 15"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">タグ（カンマ区切り）</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="例: 基礎, 初心者向け, チーム練習"
                />
              </div>
            </CardContent>
          </Card>

          {/* 動画ソース選択 */}
          <Card>
            <CardHeader>
              <CardTitle>動画ソース</CardTitle>
              <CardDescription>動画のアップロード方法を選択してください</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as 'file' | 'googledrive')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="googledrive">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Google Drive
                  </TabsTrigger>
                  <TabsTrigger value="file">
                    <Upload className="h-4 w-4 mr-2" />
                    ファイルアップロード
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="googledrive" className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Google Driveの動画を使用する場合：
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Google Driveで動画を右クリック → 「共有」</li>
                        <li>「リンクを取得」→「制限付き」を「リンクを知っている全員」に変更</li>
                        <li>リンクをコピーして下記に貼り付け</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="googleDriveUrl">Google Drive URL *</Label>
                    <div className="flex gap-2">
                      <LinkIcon className="h-4 w-4 mt-3 text-muted-foreground" />
                      <Input
                        id="googleDriveUrl"
                        type="url"
                        value={formData.googleDriveUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, googleDriveUrl: e.target.value }))}
                        placeholder="https://drive.google.com/file/d/.../view"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      共有リンクを貼り付けてください。自動的に埋め込み用に変換されます。
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      現在、ファイルアップロードは開発中です。Google Driveをご利用ください。
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="video-file">動画ファイル *</Label>
                    <Input
                      id="video-file"
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={(e) => handleFileChange(e, 'file')}
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      MP4, MOV, WebM形式に対応（最大500MB）
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 space-y-2">
                <Label htmlFor="thumbnail">サムネイル（オプション）</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                />
                <p className="text-sm text-muted-foreground">
                  JPEG, PNG, WebP形式に対応
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* エラー表示 */}
        {uploadError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* アップロードプログレス */}
        {isUploading && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>アップロード中...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href={`/${locale}/content/videos`}>
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <Film className="h-4 w-4 mr-2 animate-spin" />
                アップロード中...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                動画を追加
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}