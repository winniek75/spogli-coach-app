'use client'

import { useState, useEffect } from 'react'
import {
  Video,
  VideoWithDetails,
  CreateVideoRequest,
  UpdateVideoRequest
} from '@/types/content'
import { LocalStorageService, isLocalStorageMode, initializeData } from '@/lib/local-storage'

// シードデータなし（実データのみで管理）
const seedVideos: VideoWithDetails[] = []

const STORAGE_KEY = 'videos'

export function useVideos() {
  const [videos, setVideos] = useState<VideoWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchVideos = async (filters?: {
    category?: string
    sport?: string
    level?: number
    search?: string
    limit?: number
    offset?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      // ローカルストレージモードの場合（常にtrue）
      if (isLocalStorageMode()) {
        // ローカルストレージから直接データを取得
        const currentData = LocalStorageService.get<VideoWithDetails[]>(STORAGE_KEY) || []
        let filteredData = [...currentData]

        // フィルタリング
        if (filters) {
          if (filters.category && filters.category !== 'all') {
            filteredData = filteredData.filter(video => video.category === filters.category)
          }
          if (filters.sport && filters.sport !== 'all') {
            filteredData = filteredData.filter(video => video.sport === filters.sport)
          }
          if (filters.level) {
            filteredData = filteredData.filter(video => video.level === filters.level)
          }
          if (filters.search && filters.search !== '') {
            const searchTerm = filters.search.toLowerCase()
            filteredData = filteredData.filter(video =>
              video.title.toLowerCase().includes(searchTerm) ||
              video.description?.toLowerCase().includes(searchTerm)
            )
          }
        }

        setVideos(filteredData)
        setTotal(filteredData.length)
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const url = `/api/videos${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch videos')
      }

      setVideos(data.videos)
      setTotal(data.total)
    } catch (err) {
      // エラー時もローカルストレージから読み込み
      console.warn('Error loading videos:', err)
      const storedData = LocalStorageService.get<VideoWithDetails[]>(STORAGE_KEY) || []
      setVideos(storedData)
      setTotal(storedData.length)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createVideo = async (videoData: CreateVideoRequest) => {
    try {
      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = LocalStorageService.get<VideoWithDetails[]>(STORAGE_KEY) || []

        const newVideo: VideoWithDetails = {
          ...videoData,
          id: `video-${Date.now()}`,
          file_url: '',
          file_size: 0,
          is_downloadable: true,
          view_count: 0,
          download_count: 0,
          created_by: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by_name: { name: 'ユーザー' }
        }

        const updatedData = [...storedData, newVideo]
        LocalStorageService.set(STORAGE_KEY, updatedData)
        await fetchVideos() // リフレッシュ
        return newVideo
      }

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create video')
      }

      await fetchVideos() // リフレッシュ
      return data.video
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '動画の作成に失敗しました')
    }
  }

  const updateVideo = async (id: string, videoData: UpdateVideoRequest) => {
    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update video')
      }

      await fetchVideos() // リフレッシュ
      return data.video
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '動画の更新に失敗しました')
    }
  }

  const deleteVideo = async (id: string) => {
    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete video')
      }

      await fetchVideos() // リフレッシュ
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '動画の削除に失敗しました')
    }
  }

  const downloadVideo = async (id: string) => {
    try {
      const response = await fetch(`/api/videos/${id}/download`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download video')
      }

      // ダウンロード処理
      const link = document.createElement('a')
      link.href = data.download_url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '動画のダウンロードに失敗しました')
    }
  }

  const uploadVideo = async (videoData: {
    title: string
    description?: string
    sport: string
    category: string
    level: number
    duration_minutes: number
    file_size: number
    file_url: string
    thumbnail_url?: string
    tags?: string[]
  }) => {
    try {
      // 常にローカルストレージモードを使用（Supabase未設定のため）
      const storedData = LocalStorageService.get<VideoWithDetails[]>(STORAGE_KEY) || []
      console.log('Current videos in storage:', storedData.length)

      const newVideo: VideoWithDetails = {
        ...videoData,
        id: `video-${Date.now()}`,
        is_downloadable: true,
        view_count: 0,
        download_count: 0,
        created_by: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_name: { name: 'ユーザー' }
      }

      const updatedData = [...storedData, newVideo]
      LocalStorageService.set(STORAGE_KEY, updatedData)
      console.log('Videos after upload:', updatedData.length)

      // 確認のため、保存されたデータを読み込み
      const savedData = LocalStorageService.get<VideoWithDetails[]>(STORAGE_KEY)
      console.log('Verified saved videos:', savedData?.length)

      await fetchVideos() // リフレッシュ
      return newVideo
    } catch (err) {
      console.error('Upload error:', err)
      throw new Error(err instanceof Error ? err.message : '動画のアップロードに失敗しました')
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  return {
    videos,
    loading,
    error,
    total,
    fetchVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    downloadVideo,
    uploadVideo,
  }
}

export function useVideo(id: string) {
  const [video, setVideo] = useState<VideoWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/videos/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch video')
        }

        setVideo(data.video)
      } catch (err) {
        setError(err instanceof Error ? err.message : '動画の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [id])

  return { video, loading, error }
}