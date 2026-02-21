'use client'

import { useState, useEffect } from 'react'
import { LocalStorageService, isLocalStorageMode } from '@/lib/local-storage'

export interface Evaluation {
  id: string
  student_id: string
  student_name: string
  student_level: number
  date: string
  sport: string
  category: string
  skill: string
  rating: number
  coach: string
  notes?: string
  created_at: string
  updated_at: string
}

// シードデータなし（実データのみで管理）
const seedEvaluations: Evaluation[] = []

const STORAGE_KEY = 'evaluations'

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvaluations = async (filters?: {
    student_id?: string
    sport?: string
    date_from?: string
    date_to?: string
    search?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const currentData = LocalStorageService.get<Evaluation[]>(STORAGE_KEY) || []
        let filteredData = [...currentData]

        // フィルタリング
        if (filters) {
          if (filters.student_id && filters.student_id !== 'all') {
            filteredData = filteredData.filter(evaluation => evaluation.student_id === filters.student_id)
          }
          if (filters.sport && filters.sport !== 'all') {
            filteredData = filteredData.filter(evaluation => evaluation.sport === filters.sport)
          }
          if (filters.date_from) {
            filteredData = filteredData.filter(evaluation => evaluation.date >= filters.date_from!)
          }
          if (filters.date_to) {
            filteredData = filteredData.filter(evaluation => evaluation.date <= filters.date_to!)
          }
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            filteredData = filteredData.filter(evaluation =>
              evaluation.student_name.toLowerCase().includes(searchTerm) ||
              evaluation.skill.toLowerCase().includes(searchTerm) ||
              evaluation.notes?.toLowerCase().includes(searchTerm)
            )
          }
        }

        // 日付でソート（新しい順）
        filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setEvaluations(filteredData)
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

      const url = `/api/evaluations${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch evaluations')
      }

      setEvaluations(data.evaluations)
    } catch (err) {
      // エラー時もローカルストレージから読み込み
      console.warn('Error loading evaluations:', err)
      const storedData = LocalStorageService.get<Evaluation[]>(STORAGE_KEY) || []
      setEvaluations(storedData)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createEvaluation = async (evaluationData: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = LocalStorageService.get<Evaluation[]>(STORAGE_KEY) || []

        const newEvaluation: Evaluation = {
          ...evaluationData,
          id: `evaluation-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const updatedData = [newEvaluation, ...storedData]
        LocalStorageService.set(STORAGE_KEY, updatedData)
        await fetchEvaluations() // リフレッシュ
        return newEvaluation
      }

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create evaluation')
      }

      await fetchEvaluations() // リフレッシュ
      return data.evaluation
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '評価の作成に失敗しました')
    }
  }

  const updateEvaluation = async (id: string, evaluationData: Partial<Evaluation>) => {
    try {
      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = LocalStorageService.get<Evaluation[]>(STORAGE_KEY) || []
        const updatedData = storedData.map(evaluation =>
          evaluation.id === id
            ? { ...evaluation, ...evaluationData, updated_at: new Date().toISOString() }
            : evaluation
        )
        LocalStorageService.set(STORAGE_KEY, updatedData)
        await fetchEvaluations() // リフレッシュ
        return updatedData.find(e => e.id === id)
      }

      const response = await fetch(`/api/evaluations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update evaluation')
      }

      await fetchEvaluations() // リフレッシュ
      return data.evaluation
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '評価の更新に失敗しました')
    }
  }

  const deleteEvaluation = async (id: string) => {
    try {
      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = LocalStorageService.get<Evaluation[]>(STORAGE_KEY) || []
        const updatedData = storedData.filter(evaluation => evaluation.id !== id)
        LocalStorageService.set(STORAGE_KEY, updatedData)
        await fetchEvaluations() // リフレッシュ
        return { success: true }
      }

      const response = await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete evaluation')
      }

      await fetchEvaluations() // リフレッシュ
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '評価の削除に失敗しました')
    }
  }

  useEffect(() => {
    fetchEvaluations()
  }, [])

  return {
    evaluations,
    loading,
    error,
    fetchEvaluations,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
  }
}