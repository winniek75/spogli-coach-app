'use client'

import { useEffect, useState } from 'react'
import { LocalStorageService } from '@/lib/local-storage'
import { Button } from '@/components/ui/button'

export default function TestLocalStoragePage() {
  const [storageData, setStorageData] = useState<any>({})

  const checkStorage = () => {
    const videos = LocalStorageService.get('videos')
    const videosInitialized = localStorage.getItem('spogli_coach_videos_initialized')
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('spogli_coach_'))

    setStorageData({
      videos,
      videosInitialized,
      allKeys,
      videosCount: videos ? videos.length : 0
    })
  }

  const clearVideos = () => {
    LocalStorageService.remove('videos')
    localStorage.removeItem('spogli_coach_videos_initialized')
    checkStorage()
  }

  const addTestVideo = () => {
    const currentVideos = LocalStorageService.get('videos') || []
    const newVideo = {
      id: `test-${Date.now()}`,
      title: `テスト動画 ${Date.now()}`,
      description: 'テスト用の動画です',
      sport: 'volleyball',
      category: 'technical',
      level: 1,
      duration_minutes: 10,
      file_url: '',
      file_size: 1024000,
      is_downloadable: true,
      view_count: 0,
      download_count: 0,
      created_by: 'test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by_name: { name: 'テストユーザー' }
    }

    LocalStorageService.set('videos', [...currentVideos, newVideo])
    checkStorage()
  }

  useEffect(() => {
    checkStorage()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">LocalStorage デバッグ</h1>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkStorage}>ストレージをチェック</Button>
          <Button onClick={addTestVideo} variant="outline">テスト動画を追加</Button>
          <Button onClick={clearVideos} variant="destructive">動画をクリア</Button>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <pre>{JSON.stringify(storageData, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}