'use client'

import { useState, useEffect } from 'react'
import {
  Sport,
  SportGoal,
  CreateSportRequest,
  UpdateSportRequest,
  CreateSportGoalRequest,
  UpdateSportGoalRequest
} from '@/types/sport'

export function useSports() {
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSports = async (filters?: {
    category?: string
    is_active?: boolean
    search?: string
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

      const url = `/api/sports${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sports')
      }

      setSports(data.sports)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スポーツ情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createSport = async (sportData: CreateSportRequest) => {
    try {
      const response = await fetch('/api/sports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sportData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sport')
      }

      await fetchSports()
      return data.sport
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'スポーツの作成に失敗しました')
    }
  }

  const updateSport = async (id: string, sportData: UpdateSportRequest) => {
    try {
      const response = await fetch(`/api/sports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sportData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update sport')
      }

      await fetchSports()
      return data.sport
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'スポーツの更新に失敗しました')
    }
  }

  const deleteSport = async (id: string) => {
    try {
      const response = await fetch(`/api/sports/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete sport')
      }

      await fetchSports()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'スポーツの削除に失敗しました')
    }
  }

  useEffect(() => {
    fetchSports()
  }, [])

  return {
    sports,
    loading,
    error,
    fetchSports,
    createSport,
    updateSport,
    deleteSport,
  }
}

export function useSport(id: string) {
  const [sport, setSport] = useState<Sport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSport = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/sports/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch sport')
        }

        setSport(data.sport)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'スポーツ情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchSport()
  }, [id])

  return { sport, loading, error }
}

export function useSportGoals(sportId?: string) {
  const [goals, setGoals] = useState<SportGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = async (filters?: {
    sport_id?: string
    student_id?: string
    coach_id?: string
    status?: string
    category?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const effectiveSportId = filters?.sport_id || sportId
      if (!effectiveSportId) {
        setGoals([])
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && key !== 'sport_id') {
            params.append(key, value.toString())
          }
        })
      }

      const url = `/api/sports/${effectiveSportId}/goals${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch goals')
      }

      setGoals(data.goals)
    } catch (err) {
      setError(err instanceof Error ? err.message : '目標の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (goalData: CreateSportGoalRequest) => {
    try {
      const response = await fetch(`/api/sports/${goalData.sport_id}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create goal')
      }

      await fetchGoals({ sport_id: goalData.sport_id })
      return data.goal
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '目標の作成に失敗しました')
    }
  }

  const updateGoal = async (goalId: string, sportId: string, goalData: UpdateSportGoalRequest) => {
    try {
      const response = await fetch(`/api/sports/${sportId}/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update goal')
      }

      await fetchGoals({ sport_id: sportId })
      return data.goal
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '目標の更新に失敗しました')
    }
  }

  const deleteGoal = async (goalId: string, sportId: string) => {
    try {
      const response = await fetch(`/api/sports/${sportId}/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete goal')
      }

      await fetchGoals({ sport_id: sportId })
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '目標の削除に失敗しました')
    }
  }

  useEffect(() => {
    if (sportId) {
      fetchGoals({ sport_id: sportId })
    }
  }, [sportId])

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  }
}