'use client'

import { useState, useEffect } from 'react'
import { Badge, BadgeWithStudent, CreateBadgeRequest, AwardBadgeRequest } from '@/types/badge'
import { LocalStorageService, isLocalStorageMode, initializeData } from '@/lib/local-storage'

// シードデータなし（実データのみで管理）
const seedBadges: BadgeWithStudent[] = []

const STORAGE_KEY = 'badges'

export function useBadges() {
  const [badges, setBadges] = useState<BadgeWithStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBadges = async (filters?: {
    student_id?: string
    sport?: string
    badge_type?: string
    awarded?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = initializeData(STORAGE_KEY, seedBadges)
        let filteredData = [...storedData]

        // フィルタリング
        if (filters) {
          if (filters.student_id) {
            filteredData = filteredData.filter(badge => badge.student_id === filters.student_id)
          }
          if (filters.sport) {
            filteredData = filteredData.filter(badge => badge.sport === filters.sport)
          }
          if (filters.badge_type) {
            filteredData = filteredData.filter(badge => badge.badge_type === filters.badge_type)
          }
          if (filters.awarded) {
            filteredData = filteredData.filter(badge => {
              const hasAwarded = !!badge.awarded_date
              return filters.awarded === 'true' ? hasAwarded : !hasAwarded
            })
          }
        }

        setBadges(filteredData)
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
      }

      const url = `/api/badges${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch badges')
      }

      setBadges(data.badges)
    } catch (err) {
      // エラー時もローカルストレージから読み込み
      console.warn('Error loading badges:', err)
      const storedData = initializeData(STORAGE_KEY, seedBadges)
      setBadges(storedData)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createBadge = async (badgeData: CreateBadgeRequest) => {
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<BadgeWithStudent[]>(STORAGE_KEY) || []

      const newBadge: BadgeWithStudent = {
        id: `badge-${Date.now()}`,
        ...badgeData,
        awarded_date: null,
        awarded_by: null,
        ceremony_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const updatedData = [...storedData, newBadge]
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchBadges() // リフレッシュ
      return newBadge
    }

    try {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badgeData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create badge')
      }

      await fetchBadges() // リフレッシュ
      return data.badge
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'バッジの作成に失敗しました')
    }
  }

  const awardBadge = async (badgeId: string, awardData: AwardBadgeRequest) => {
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<BadgeWithStudent[]>(STORAGE_KEY) || []
      const updatedData = storedData.map(badge =>
        badge.id === badgeId
          ? {
              ...badge,
              awarded_date: awardData.awarded_date,
              awarded_by: awardData.awarded_by || 'コーチ',
              ceremony_completed: awardData.ceremony_completed || false,
              updated_at: new Date().toISOString(),
            }
          : badge
      )
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchBadges() // リフレッシュ
      return updatedData.find(b => b.id === badgeId)
    }

    try {
      const response = await fetch(`/api/badges/${badgeId}/award`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(awardData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to award badge')
      }

      await fetchBadges() // リフレッシュ
      return data.badge
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'バッジの授与に失敗しました')
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [])

  return {
    badges,
    loading,
    error,
    fetchBadges,
    createBadge,
    awardBadge,
  }
}