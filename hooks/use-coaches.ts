'use client'

import { useState, useEffect } from 'react'
import { Coach, CoachWithCertifications, CreateCoachRequest, UpdateCoachRequest, Certification } from '@/types/coach'
import { LocalStorageService, isLocalStorageMode } from '@/lib/local-storage'

// シードデータなし（実データのみで管理）
const seedCoaches: CoachWithCertifications[] = []

const STORAGE_KEY = 'coaches'

export function useCoaches() {
  const [coaches, setCoaches] = useState<CoachWithCertifications[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoaches = async () => {
    try {
      setLoading(true)
      setError(null)

      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const currentData = LocalStorageService.get<CoachWithCertifications[]>(STORAGE_KEY) || []
        setCoaches(currentData)
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
      // エラー時もローカルストレージから読み込み
      console.warn('Error loading coaches:', err)
      const storedData = LocalStorageService.get<CoachWithCertifications[]>(STORAGE_KEY) || []
      setCoaches(storedData)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createCoach = async (coachData: CreateCoachRequest) => {
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<CoachWithCertifications[]>(STORAGE_KEY) || []

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

      const updatedData = [...storedData, newCoach]
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchCoaches() // リフレッシュ
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
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<CoachWithCertifications[]>(STORAGE_KEY) || []
      const updatedData = storedData.map(c =>
        c.id === id ? { ...c, ...coachData, updated_at: new Date().toISOString() } : c
      )
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchCoaches() // リフレッシュ
      return updatedData.find(c => c.id === id)
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
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<CoachWithCertifications[]>(STORAGE_KEY) || []
      const updatedData = storedData.filter(c => c.id !== id)
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchCoaches() // リフレッシュ
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

        // ローカルストレージモードの場合
        if (isLocalStorageMode()) {
          const storedData = LocalStorageService.get<CoachWithCertifications[]>(STORAGE_KEY) || []
          const found = storedData.find(c => c.id === id)
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
        // エラー時はローカルストレージから取得
        const storedData = LocalStorageService.get<CoachWithCertifications[]>(STORAGE_KEY) || []
        const found = storedData.find(c => c.id === id)
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
