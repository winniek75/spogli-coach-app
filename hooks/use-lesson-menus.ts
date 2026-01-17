'use client'

import { useState, useEffect } from 'react'
import {
  LessonMenu,
  LessonMenuWithDetails,
  CreateLessonMenuRequest,
  UpdateLessonMenuRequest
} from '@/types/lesson-menu'

export function useLessonMenus() {
  const [lessonMenus, setLessonMenus] = useState<LessonMenuWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchLessonMenus = async (filters?: {
    sport?: string
    level?: number
    search?: string
    is_public?: boolean
    is_template?: boolean
    limit?: number
    offset?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const url = `/api/lesson-menus${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch lesson menus')
      }

      setLessonMenus(data.lessonMenus)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レッスンメニューの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createLessonMenu = async (menuData: CreateLessonMenuRequest) => {
    try {
      const response = await fetch('/api/lesson-menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lesson menu')
      }

      await fetchLessonMenus() // リフレッシュ
      return data.lessonMenu
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'レッスンメニューの作成に失敗しました')
    }
  }

  const updateLessonMenu = async (id: string, menuData: UpdateLessonMenuRequest) => {
    try {
      const response = await fetch(`/api/lesson-menus/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lesson menu')
      }

      await fetchLessonMenus() // リフレッシュ
      return data.lessonMenu
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'レッスンメニューの更新に失敗しました')
    }
  }

  const deleteLessonMenu = async (id: string) => {
    try {
      const response = await fetch(`/api/lesson-menus/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete lesson menu')
      }

      await fetchLessonMenus() // リフレッシュ
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'レッスンメニューの削除に失敗しました')
    }
  }

  const shareLessonMenu = async (id: string, shareData: {
    emails: string[]
    message?: string
    expires_days?: number
  }) => {
    try {
      const response = await fetch(`/api/lesson-menus/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share lesson menu')
      }

      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'レッスンメニューの共有に失敗しました')
    }
  }

  useEffect(() => {
    fetchLessonMenus()
  }, [])

  return {
    lessonMenus,
    loading,
    error,
    total,
    fetchLessonMenus,
    createLessonMenu,
    updateLessonMenu,
    deleteLessonMenu,
    shareLessonMenu,
  }
}

export function useLessonMenu(id: string) {
  const [lessonMenu, setLessonMenu] = useState<LessonMenuWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessonMenu = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/lesson-menus/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch lesson menu')
        }

        setLessonMenu(data.lessonMenu)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'レッスンメニューの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchLessonMenu()
  }, [id])

  return { lessonMenu, loading, error }
}