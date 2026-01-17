'use client'

import { useState, useEffect } from 'react'
import { Coach, CoachWithCertifications, CreateCoachRequest, UpdateCoachRequest } from '@/types/coach'

export function useCoaches() {
  const [coaches, setCoaches] = useState<CoachWithCertifications[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoaches = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/coaches')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch coaches')
      }

      setCoaches(data.coaches)
    } catch (err) {
      setError(err instanceof Error ? err.message : '講師の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createCoach = async (coachData: CreateCoachRequest) => {
    try {
      const response = await fetch('/api/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coachData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create coach')
      }

      await fetchCoaches() // リフレッシュ
      return data.coach
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '講師の作成に失敗しました')
    }
  }

  const updateCoach = async (id: string, coachData: UpdateCoachRequest) => {
    try {
      const response = await fetch(`/api/coaches/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coachData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update coach')
      }

      await fetchCoaches() // リフレッシュ
      return data.coach
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '講師の更新に失敗しました')
    }
  }

  const deleteCoach = async (id: string) => {
    try {
      const response = await fetch(`/api/coaches/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete coach')
      }

      await fetchCoaches() // リフレッシュ
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '講師の削除に失敗しました')
    }
  }

  useEffect(() => {
    fetchCoaches()
  }, [])

  return {
    coaches,
    loading,
    error,
    fetchCoaches,
    createCoach,
    updateCoach,
    deleteCoach,
  }
}

export function useCoach(id: string) {
  const [coach, setCoach] = useState<CoachWithCertifications | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/coaches/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch coach')
        }

        setCoach(data.coach)
      } catch (err) {
        setError(err instanceof Error ? err.message : '講師の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCoach()
    }
  }, [id])

  return { coach, loading, error }
}