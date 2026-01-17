'use client'

import { useState, useEffect } from 'react'
import {
  MissionSheet,
  MissionSheetWithDetails,
  CreateMissionSheetRequest,
  UpdateMissionSheetRequest,
  UpdateMissionItemRequest
} from '@/types/mission'

export function useMissions() {
  const [missionSheets, setMissionSheets] = useState<MissionSheetWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMissions = async (filters?: {
    student_id?: string
    status?: string
    lesson_date?: string
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

      const url = `/api/mission-sheets${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch mission sheets')
      }

      // 完了率を計算
      const sheetsWithCompletionRate = data.missionSheets.map((sheet: MissionSheetWithDetails) => {
        if (sheet.mission_items && sheet.mission_items.length > 0) {
          const completedCount = sheet.mission_items.filter(item => item.completed_at).length
          sheet.completion_rate = Math.round((completedCount / sheet.mission_items.length) * 100)
        } else {
          sheet.completion_rate = 0
        }
        return sheet
      })

      setMissionSheets(sheetsWithCompletionRate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ミッションシートの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createMissionSheet = async (missionData: CreateMissionSheetRequest) => {
    try {
      const response = await fetch('/api/mission-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create mission sheet')
      }

      await fetchMissions() // リフレッシュ
      return data.missionSheet
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ミッションシートの作成に失敗しました')
    }
  }

  const updateMissionSheet = async (id: string, missionData: UpdateMissionSheetRequest) => {
    try {
      const response = await fetch(`/api/mission-sheets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update mission sheet')
      }

      await fetchMissions() // リフレッシュ
      return data.missionSheet
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ミッションシートの更新に失敗しました')
    }
  }

  const deleteMissionSheet = async (id: string) => {
    try {
      const response = await fetch(`/api/mission-sheets/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete mission sheet')
      }

      await fetchMissions() // リフレッシュ
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ミッションシートの削除に失敗しました')
    }
  }

  const updateMissionItem = async (itemId: string, itemData: UpdateMissionItemRequest) => {
    try {
      const response = await fetch(`/api/mission-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update mission item')
      }

      await fetchMissions() // リフレッシュ
      return data.missionItem
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ミッション項目の更新に失敗しました')
    }
  }

  useEffect(() => {
    fetchMissions()
  }, [])

  return {
    missionSheets,
    loading,
    error,
    fetchMissions,
    createMissionSheet,
    updateMissionSheet,
    deleteMissionSheet,
    updateMissionItem,
  }
}

export function useMission(id: string) {
  const [missionSheet, setMissionSheet] = useState<MissionSheetWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMission = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/mission-sheets/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch mission sheet')
        }

        // 完了率を計算
        if (data.missionSheet.mission_items && data.missionSheet.mission_items.length > 0) {
          const completedCount = data.missionSheet.mission_items.filter((item: any) => item.completed_at).length
          data.missionSheet.completion_rate = Math.round((completedCount / data.missionSheet.mission_items.length) * 100)
        } else {
          data.missionSheet.completion_rate = 0
        }

        setMissionSheet(data.missionSheet)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ミッションシートの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMission()
    }
  }, [id])

  return { missionSheet, loading, error }
}