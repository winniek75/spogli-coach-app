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

// デモデータ
const demoSports: Sport[] = [
  {
    id: 'sport-1',
    code: 'volleyball',
    name: 'バレーボール',
    description: 'チームワークと基本的なボールハンドリングスキルを身につけます',
    category: { id: 'ball', name: '球技', description: 'ボールを使用するスポーツ', display_order: 1 },
    icon: '🏐',
    color: '#f59e0b',
    is_active: true,
    objectives: [
      { id: 'obj-1', sport_id: 'sport-1', title: 'キャッチ', description: '両手でボールをキャッチする', category: 'technical', level: 1, created_at: '', updated_at: '' },
      { id: 'obj-2', sport_id: 'sport-1', title: 'トス', description: 'アンダーハンドでトスする', category: 'technical', level: 2, created_at: '', updated_at: '' },
    ],
    skills: [
      { id: 'skill-1', sport_id: 'sport-1', name: '両手キャッチ', category: 'basic', difficulty: 1, created_at: '' },
      { id: 'skill-2', sport_id: 'sport-1', name: 'アンダーハンドパス', category: 'basic', difficulty: 2, created_at: '' },
    ],
    levels: [
      { id: 'level-1', sport_id: 'sport-1', level_number: 1, name: 'Rookie' },
      { id: 'level-2', sport_id: 'sport-1', level_number: 2, name: 'Challenger' },
    ],
    equipment: [
      { id: 'eq-1', name: 'バレーボール', category: 'essential' },
      { id: 'eq-2', name: 'ネット', category: 'essential' },
    ],
    created_at: '2025-01-01',
    updated_at: '2025-01-15',
  },
  {
    id: 'sport-2',
    code: 'basketball',
    name: 'バスケットボール',
    description: 'ドリブル、パス、シュートの基本を学びます',
    category: { id: 'ball', name: '球技', description: 'ボールを使用するスポーツ', display_order: 1 },
    icon: '🏀',
    color: '#ef4444',
    is_active: true,
    objectives: [
      { id: 'obj-3', sport_id: 'sport-2', title: 'ドリブル', description: 'ボールをドリブルする', category: 'technical', level: 1, created_at: '', updated_at: '' },
    ],
    skills: [
      { id: 'skill-3', sport_id: 'sport-2', name: 'ワンハンドドリブル', category: 'basic', difficulty: 1, created_at: '' },
    ],
    levels: [
      { id: 'level-3', sport_id: 'sport-2', level_number: 1, name: 'Rookie' },
    ],
    equipment: [
      { id: 'eq-3', name: 'バスケットボール', category: 'essential' },
    ],
    created_at: '2025-01-01',
    updated_at: '2025-01-15',
  },
  {
    id: 'sport-3',
    code: 'soccer',
    name: 'サッカー',
    description: '足でボールをコントロールする技術を習得します',
    category: { id: 'ball', name: '球技', description: 'ボールを使用するスポーツ', display_order: 1 },
    icon: '⚽',
    color: '#22c55e',
    is_active: true,
    objectives: [],
    skills: [],
    levels: [],
    equipment: [],
    created_at: '2025-01-01',
    updated_at: '2025-01-15',
  },
  {
    id: 'sport-4',
    code: 'tennis',
    name: 'テニス',
    description: 'ラケットスポーツの基本を学びます',
    category: { id: 'ball', name: '球技', description: 'ボールを使用するスポーツ', display_order: 1 },
    icon: '🎾',
    color: '#84cc16',
    is_active: true,
    objectives: [],
    skills: [],
    levels: [],
    equipment: [],
    created_at: '2025-01-01',
    updated_at: '2025-01-15',
  },
  {
    id: 'sport-5',
    code: 'rugby',
    name: 'ラグビー',
    description: 'チームプレーとボールの扱い方を学びます',
    category: { id: 'ball', name: '球技', description: 'ボールを使用するスポーツ', display_order: 1 },
    icon: '🏉',
    color: '#8b5cf6',
    is_active: true,
    objectives: [],
    skills: [],
    levels: [],
    equipment: [],
    created_at: '2025-01-01',
    updated_at: '2025-01-15',
  },
  {
    id: 'sport-6',
    code: 'baseball',
    name: '野球',
    description: '投げる、打つ、捕るの基本を学びます',
    category: { id: 'ball', name: '球技', description: 'ボールを使用するスポーツ', display_order: 1 },
    icon: '⚾',
    color: '#06b6d4',
    is_active: true,
    objectives: [],
    skills: [],
    levels: [],
    equipment: [],
    created_at: '2025-01-01',
    updated_at: '2025-01-15',
  },
]

// デモモードかどうかを判定
const isDemoMode = () => {
  if (typeof window === 'undefined') return true
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url' ||
         process.env.NEXT_PUBLIC_SUPABASE_URL === ''
}

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

      // デモモードの場合はデモデータを使用
      if (isDemoMode()) {
        let filteredSports = [...demoSports]
        
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
      // エラー時もデモデータにフォールバック
      console.warn('API failed, using demo data:', err)
      setSports(demoSports)
      setError(null) // エラーを表示しない
    } finally {
      setLoading(false)
    }
  }

  const createSport = async (sportData: CreateSportRequest) => {
    // デモモードの場合はローカルで追加
    if (isDemoMode()) {
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
      setSports(prev => [...prev, newSport])
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
    // デモモードの場合はローカルで更新
    if (isDemoMode()) {
      setSports(prev => prev.map(s => 
        s.id === id ? { ...s, ...sportData, updated_at: new Date().toISOString() } : s
      ))
      return sports.find(s => s.id === id)
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
    // デモモードの場合はローカルで削除
    if (isDemoMode()) {
      setSports(prev => prev.filter(s => s.id !== id))
      return
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

        // デモモードの場合はデモデータから取得
        if (isDemoMode()) {
          const found = demoSports.find(s => s.id === id)
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
        // エラー時はデモデータにフォールバック
        const found = demoSports.find(s => s.id === id)
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

      // デモモードの場合は空の配列を返す
      if (isDemoMode()) {
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
    if (isDemoMode()) {
      const newGoal: SportGoal = {
        id: `goal-${Date.now()}`,
        ...goalData,
        coach_id: 'demo-coach',
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
    if (isDemoMode()) {
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
    if (isDemoMode()) {
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
