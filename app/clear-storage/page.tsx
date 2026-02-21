'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, RefreshCw } from 'lucide-react'

export default function ClearStoragePage() {
  const [cleared, setCleared] = useState(false)

  const clearVideos = () => {
    localStorage.removeItem('spogli_coach_videos')
    localStorage.removeItem('spogli_coach_videos_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearPDFMaterials = () => {
    localStorage.removeItem('spogli_coach_pdf_materials')
    localStorage.removeItem('spogli_coach_pdf_materials_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearCoaches = () => {
    localStorage.removeItem('spogli_coach_coaches')
    localStorage.removeItem('spogli_coach_coaches_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearLessonSchedules = () => {
    localStorage.removeItem('spogli_coach_lesson_schedules')
    localStorage.removeItem('spogli_coach_lesson_schedules_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearStudents = () => {
    localStorage.removeItem('spogli_coach_students')
    localStorage.removeItem('spogli_coach_students_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearMissionSheets = () => {
    localStorage.removeItem('spogli_coach_mission_sheets')
    localStorage.removeItem('spogli_coach_mission_sheets_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearEvaluations = () => {
    localStorage.removeItem('spogli_coach_evaluations')
    localStorage.removeItem('spogli_coach_evaluations_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearSports = () => {
    localStorage.removeItem('spogli_coach_sports')
    localStorage.removeItem('spogli_coach_sports_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearBadges = () => {
    localStorage.removeItem('spogli_coach_badges')
    localStorage.removeItem('spogli_coach_badges_initialized')
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const clearAllStorage = () => {
    // スポグリコーチ関連のすべてのデータをクリア
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('spogli_coach_')) {
        localStorage.removeItem(key)
      }
    })
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>ローカルストレージ管理</CardTitle>
          <CardDescription>
            ブラウザに保存されているデータを管理します。
            データをクリアすると、アップロードした動画や教材が削除されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cleared && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                データをクリアしました
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">動画ライブラリ</h3>
                <p className="text-sm text-muted-foreground">
                  アップロードした動画データをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearVideos}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                動画をクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">教材ライブラリ</h3>
                <p className="text-sm text-muted-foreground">
                  アップロードしたPDF教材データをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearPDFMaterials}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                教材をクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">講師管理</h3>
                <p className="text-sm text-muted-foreground">
                  登録された講師データをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearCoaches}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                講師をクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">レッスンスケジュール</h3>
                <p className="text-sm text-muted-foreground">
                  登録されたレッスンスケジュールをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearLessonSchedules}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                スケジュールをクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">生徒データ</h3>
                <p className="text-sm text-muted-foreground">
                  登録された生徒データをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearStudents}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                生徒をクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">ミッションシート</h3>
                <p className="text-sm text-muted-foreground">
                  登録されたミッションシートをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearMissionSheets}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                ミッションをクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">評価履歴</h3>
                <p className="text-sm text-muted-foreground">
                  登録された評価データをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearEvaluations}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                評価をクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">スポーツデータ</h3>
                <p className="text-sm text-muted-foreground">
                  登録されたスポーツデータをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearSports}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                スポーツをクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">バッジデータ</h3>
                <p className="text-sm text-muted-foreground">
                  登録されたバッジデータをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearBadges}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                バッジをクリア
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
              <div>
                <h3 className="font-medium text-red-900">すべてのデータ</h3>
                <p className="text-sm text-red-700">
                  スポグリコーチのすべてのローカルデータをクリア
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={clearAllStorage}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                すべてクリア
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">クリア後の手順</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. データクリア後、ページをリロードしてください</li>
              <li>2. 動画/教材ページで新しくファイルをアップロードできます</li>
              <li>3. アップロードしたファイルは即座にライブラリに表示されます</li>
            </ol>
          </div>

          <Button
            onClick={() => window.location.reload()}
            className="w-full gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            ページをリロード
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}