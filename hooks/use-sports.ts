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

import { LocalStorageService, isLocalStorageMode, initializeData } from '@/lib/local-storage'

// シードデータなし（実データのみで管理）
const seedSports: Sport[] = []

const STORAGE_KEY = 'sports'

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

      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = initializeData(STORAGE_KEY, seedSports)
        let filteredSports = [...storedData]

        if (filters?.category) {
          filteredSports = filteredSports.filter(s => s.category?.id === filters.category)
        }
        if (filters?.is_active !== undefined) {
          filteredSports = filteredSports.filter(s => s.is_active === filters.is_active)
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          filteredSports = filteredSports.filter(s =>
            s.name.toLowerCase().includes(searchLower) ||
            s.code.toLowerCase().includes(searchLower)
          )
        }

        setSports(filteredSports)
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

      const url = `/api/sports${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sports')
      }

      setSports(data.sports)
    } catch (err) {
      // エラー時もローカルストレージから読み込み
      console.warn('API failed, using local storage:', err)
      const storedData = initializeData(STORAGE_KEY, seedSports)
      setSports(storedData)
      setError(null) // エラーを表示しない
    } finally {
      setLoading(false)
    }
  }

  const createSport = async (sportData: CreateSportRequest) => {
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<Sport[]>(STORAGE_KEY) || []
      const newSport: Sport = {
        id: `sport-${Date.now()}`,
        code: sportData.code,
        name: sportData.name,
        description: sportData.description,
        category: { id: sportData.category_id, name: '', description: '', display_order: 0 },
        icon: sportData.icon,
        color: sportData.color,
        is_active: sportData.is_active ?? true,
        objectives: [],
        skills: [],
        levels: [],
        equipment: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const updatedData = [...storedData, newSport]
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchSports()
      return newSport
    }

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
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<Sport[]>(STORAGE_KEY) || []
      const updatedData = storedData.map(s =>
        s.id === id ? { ...s, ...sportData, updated_at: new Date().toISOString() } : s
      )
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchSports()
      return updatedData.find(s => s.id === id)
    }

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
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<Sport[]>(STORAGE_KEY) || []
      const updatedData = storedData.filter(s => s.id !== id)
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchSports()
      return { success: true }
    }

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

        // ローカルストレージモードの場合
        if (isLocalStorageMode()) {
          const storedData = LocalStorageService.get<Sport[]>(STORAGE_KEY) || []
          const found = storedData.find(s => s.id === id)
          setSport(found || null)
          setLoading(false)
          return
        }

        const response = await fetch(`/api/sports/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch sport')
        }

        setSport(data.sport)
      } catch (err) {
        // エラー時はローカルストレージから取得
        const storedData = LocalStorageService.get<Sport[]>(STORAGE_KEY) || []
        const found = storedData.find(s => s.id === id)
        if (found) {
          setSport(found)
          setError(null)
        } else {
          setError(err instanceof Error ? err.message : 'スポーツ情報の取得に失敗しました')
        }
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

      // ローカルストレージモードの場合は空の配列を返す
      if (isLocalStorageMode()) {
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
      setGoals([])
      setError(null) // エラーを表示しない
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (goalData: CreateSportGoalRequest) => {
    if (isLocalStorageMode()) {
      const newGoal: SportGoal = {
        id: `goal-${Date.now()}`,
        ...goalData,
        coach_id: 'coach-1',
        status: 'not_started',
        start_date: new Date().toISOString(),
        is_public: goalData.is_public ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setGoals(prev => [...prev, newGoal])
      return newGoal
    }

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
    if (isLocalStorageMode()) {
      setGoals(prev => prev.map(g =>
        g.id === goalId ? { ...g, ...goalData, updated_at: new Date().toISOString() } : g
      ))
      return goals.find(g => g.id === goalId)
    }

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
    if (isLocalStorageMode()) {
      setGoals(prev => prev.filter(g => g.id !== goalId))
      return
    }

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
