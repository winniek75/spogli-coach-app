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

      // Supabaseモードでは常にAPIエンドポイントを使用

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
    } finally {
      setLoading(false)
    }
  }

  const createVideo = async (videoData: CreateVideoRequest) => {
    try {
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
    return createVideo({
      title: videoData.title,
      description: videoData.description,
      url: videoData.file_url,
      thumbnail_url: videoData.thumbnail_url,
      duration: videoData.duration_minutes * 60, // 分から秒に変換
      file_size: videoData.file_size,
      category: videoData.category,
      tags: videoData.tags,
      level: videoData.level,
      sport: videoData.sport,
      is_downloadable: true
    })
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