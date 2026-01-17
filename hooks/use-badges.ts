'use client'

import { useState, useEffect } from 'react'
import { Badge, BadgeWithStudent, CreateBadgeRequest, AwardBadgeRequest } from '@/types/badge'

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
      setError(err instanceof Error ? err.message : 'バッジの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createBadge = async (badgeData: CreateBadgeRequest) => {
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