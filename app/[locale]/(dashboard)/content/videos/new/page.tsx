'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useVideos } from '@/hooks/use-videos'
import { useGooglePicker } from '@/hooks/use-google-picker'
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
import { ArrowLeft, Upload, Film, HardDrive, Image, X, FileVideo, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CONTENT_CATEGORIES } from '@/types/content'
import { convertGoogleDriveVideoUrl, convertGoogleDriveImageUrl } from '@/lib/google-drive-utils'

export default function NewVideoPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'ja'
  const { uploadVideo } = useVideos()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    category: '',
    level: '1',
    duration_minutes: '',
    tags: '',
    googleDriveUrl: '',
    googleDriveFileName: '',
    thumbnailGoogleDriveUrl: '',
    thumbnailFileName: '',
  })

  // Google Drive Picker for video
  const videoPicker = useGooglePicker({
    onPicked: (result) => {
      const driveUrl = result.url
      setFormData(prev => ({
        ...prev,
        googleDriveUrl: driveUrl,
        googleDriveFileName: result.name,
        // タイトルが未入力なら、ファイル名を自動セット（拡張子除去）
        title: prev.title || result.name.replace(/\.[^/.]+$/, ''),
      }))
    },
  })

  // Google Drive Picker for thumbnail
  const thumbnailPicker = useGooglePicker({
    onPicked: (result) => {
      setFormData(prev => ({
        ...prev,
        thumbnailGoogleDriveUrl: result.url,
        thumbnailFileName: result.name,
      }))
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.googleDriveUrl) {
      setUploadError('Google Driveから動画を選択してください')
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
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const videoUrl = convertGoogleDriveVideoUrl(formData.googleDriveUrl)

      let thumbnailUrl = ''
      if (formData.thumbnailGoogleDriveUrl) {
        thumbnailUrl = convertGoogleDriveImageUrl(formData.thumbnailGoogleDriveUrl, 'm')
      }

      await uploadVideo({
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        category: formData.category,
        level: parseInt(formData.level),
        duration_minutes: parseInt(formData.duration_minutes) || 0,
        file_size: 0,
        file_url: videoUrl,
        thumbnail_url: thumbnailUrl || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        router.push(`/${locale}/content/videos`)
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : '動画の登録に失敗しました')
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
            Google Driveから動画を選択して追加
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

          {/* 動画・サムネイル選択 */}
          <div className="space-y-6">
            {/* 動画選択 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  動画ソース
                </CardTitle>
                <CardDescription>Google Driveから動画ファイルを選択してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.googleDriveUrl ? (
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileVideo className="h-8 w-8 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-green-800 truncate">
                            {formData.googleDriveFileName || '選択された動画'}
                          </p>
                          <p className="text-xs text-green-600 truncate">
                            {formData.googleDriveUrl}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-green-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          googleDriveUrl: '',
                          googleDriveFileName: '',
                        }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed border-2 flex flex-col gap-2"
                    onClick={() => videoPicker.openPicker('video')}
                    disabled={videoPicker.isLoading}
                  >
                    {videoPicker.isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <HardDrive className="h-8 w-8 text-muted-foreground" />
                        <span className="text-muted-foreground">Google Driveから動画を選択</span>
                        <span className="text-xs text-muted-foreground">MP4, MOV, WebM形式に対応</span>
                      </>
                    )}
                  </Button>
                )}

                {videoPicker.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{videoPicker.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* サムネイル選択 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  サムネイル（オプション）
                </CardTitle>
                <CardDescription>Google Driveから画像を選択してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.thumbnailGoogleDriveUrl ? (
                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Image className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-blue-800 truncate">
                            {formData.thumbnailFileName || '選択された画像'}
                          </p>
                          <p className="text-xs text-blue-600 truncate">
                            {formData.thumbnailGoogleDriveUrl}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-blue-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          thumbnailGoogleDriveUrl: '',
                          thumbnailFileName: '',
                        }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
                    onClick={() => thumbnailPicker.openPicker('image')}
                    disabled={thumbnailPicker.isLoading}
                  >
                    {thumbnailPicker.isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Image className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Google Driveから画像を選択</span>
                      </>
                    )}
                  </Button>
                )}

                {thumbnailPicker.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{thumbnailPicker.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
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
                  <span>登録中...</span>
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
                登録中...
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
