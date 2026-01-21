'use client'

import { useState, useEffect } from 'react'
import { Coach, CoachWithCertifications, CreateCoachRequest, UpdateCoachRequest, Certification } from '@/types/coach'

// デモデータ
const demoCoaches: CoachWithCertifications[] = [
  {
    id: 'coach-1',
    name: 'Risa',
    name_en: 'Risa',
    email: 'risa@spogli.com',
    phone: '090-1234-5678',
    line_id: 'risa_line',
    nationality: 'フィリピン',
    languages: ['英語', '日本語', 'フィリピン語'],
    role: 'senior_coach',
    schools: ['ageo', 'okegawa'],
    hire_date: '2024-04-01',
    status: 'active',
    notes: '経験豊富なシニアコーチ',
    created_at: '2024-04-01',
    updated_at: '2025-01-15',
    certifications: [
      {
        id: 'cert-1',
        coach_id: 'coach-1',
        name: 'TEFL Certificate',
        issued_date: '2023-06-01',
        expiry_date: '2025-12-31',
        status: 'valid',
        reminder_sent: false,
        created_at: '2024-04-01',
        updated_at: '2024-04-01',
      },
    ],
  },
  {
    id: 'coach-2',
    name: 'Gicko',
    name_en: 'Gicko',
    email: 'gicko@spogli.com',
    phone: '090-2345-6789',
    nationality: 'アメリカ',
    languages: ['英語', '日本語'],
    role: 'coach',
    schools: ['ageo'],
    hire_date: '2024-06-01',
    status: 'active',
    created_at: '2024-06-01',
    updated_at: '2025-01-15',
    certifications: [],
  },
  {
    id: 'coach-3',
    name: 'Sapta',
    name_en: 'Sapta',
    email: 'sapta@spogli.com',
    phone: '090-3456-7890',
    nationality: 'インドネシア',
    languages: ['英語', '日本語', 'インドネシア語'],
    role: 'coach',
    schools: ['ageo', 'okegawa'],
    hire_date: '2024-08-01',
    status: 'active',
    created_at: '2024-08-01',
    updated_at: '2025-01-15',
    certifications: [
      {
        id: 'cert-2',
        coach_id: 'coach-3',
        name: 'スポーツ指導員',
        issued_date: '2024-01-01',
        expiry_date: '2025-02-28',
        status: 'expiring_soon',
        reminder_sent: true,
        created_at: '2024-08-01',
        updated_at: '2025-01-10',
      },
    ],
  },
  {
    id: 'coach-4',
    name: 'Aung',
    name_en: 'Aung',
    email: 'aung@spogli.com',
    phone: '090-4567-8901',
    nationality: 'ミャンマー',
    languages: ['英語', '日本語', 'ビルマ語'],
    role: 'coach',
    schools: ['okegawa'],
    hire_date: '2024-10-01',
    status: 'active',
    created_at: '2024-10-01',
    updated_at: '2025-01-15',
    certifications: [],
  },
]

// デモモードかどうかを判定
const isDemoMode = () => {
  if (typeof window === 'undefined') return true
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url' ||
         process.env.NEXT_PUBLIC_SUPABASE_URL === ''
}

export function useCoaches() {
  const [coaches, setCoaches] = useState<CoachWithCertifications[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoaches = async () => {
    try {
      setLoading(true)
      setError(null)

      // デモモードの場合はデモデータを使用
      if (isDemoMode()) {
        setCoaches(demoCoaches)
        setLoading(false)
        return
      }

      const response = await fetch('/api/coaches')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch coaches')
      }

      setCoaches(data.coaches)
    } catch (err) {
      // エラー時もデモデータにフォールバック
      console.warn('API failed, using demo data:', err)
      setCoaches(demoCoaches)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createCoach = async (coachData: CreateCoachRequest) => {
    // デモモードの場合はローカルで追加
    if (isDemoMode()) {
      const newCoach: CoachWithCertifications = {
        id: `coach-${Date.now()}`,
        name: coachData.name,
        name_en: coachData.name_en,
        email: coachData.email,
        phone: coachData.phone,
        line_id: coachData.line_id,
        nationality: coachData.nationality,
        languages: coachData.languages || [],
        role: coachData.role || 'coach',
        schools: coachData.schools || [],
        hire_date: coachData.hire_date,
        status: 'active',
        notes: coachData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        certifications: [],
      }
      setCoaches(prev => [...prev, newCoach])
      return newCoach
    }

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

      await fetchCoaches()
      return data.coach
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '講師の作成に失敗しました')
    }
  }

  const updateCoach = async (id: string, coachData: UpdateCoachRequest) => {
    // デモモードの場合はローカルで更新
    if (isDemoMode()) {
      setCoaches(prev => prev.map(c => 
        c.id === id ? { ...c, ...coachData, updated_at: new Date().toISOString() } : c
      ))
      return coaches.find(c => c.id === id)
    }

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

      await fetchCoaches()
      return data.coach
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '講師の更新に失敗しました')
    }
  }

  const deleteCoach = async (id: string) => {
    // デモモードの場合はローカルで削除
    if (isDemoMode()) {
      setCoaches(prev => prev.filter(c => c.id !== id))
      return { success: true }
    }

    try {
      const response = await fetch(`/api/coaches/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete coach')
      }

      await fetchCoaches()
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
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        // デモモードの場合はデモデータから取得
        if (isDemoMode()) {
          const found = demoCoaches.find(c => c.id === id)
          setCoach(found || null)
          setLoading(false)
          return
        }

        const response = await fetch(`/api/coaches/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch coach')
        }

        setCoach(data.coach)
      } catch (err) {
        // エラー時はデモデータにフォールバック
        const found = demoCoaches.find(c => c.id === id)
        if (found) {
          setCoach(found)
          setError(null)
        } else {
          setError(err instanceof Error ? err.message : '講師の取得に失敗しました')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCoach()
  }, [id])

  return { coach, loading, error }
}
