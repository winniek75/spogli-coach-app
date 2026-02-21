'use client'

import { useState, useEffect } from 'react'
import {
  MissionSheet,
  MissionSheetWithDetails,
  CreateMissionSheetRequest,
  UpdateMissionSheetRequest,
  UpdateMissionItemRequest
} from '@/types/mission'
import { LocalStorageService, isLocalStorageMode } from '@/lib/local-storage'

// シードデータなし（実データのみで管理）
const seedMissionSheets: MissionSheetWithDetails[] = []

const STORAGE_KEY = 'mission_sheets'

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

      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const currentData = LocalStorageService.get<MissionSheetWithDetails[]>(STORAGE_KEY) || []
        let filteredData = [...currentData]

        // フィルタリング
        if (filters) {
          if (filters.student_id) {
            filteredData = filteredData.filter(sheet => sheet.student_id === filters.student_id)
          }
          if (filters.status) {
            filteredData = filteredData.filter(sheet => sheet.status === filters.status)
          }
          if (filters.lesson_date) {
            filteredData = filteredData.filter(sheet => sheet.lesson_date === filters.lesson_date)
          }
        }

        setMissionSheets(filteredData)
        setLoading(false)
        return
      }

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
      // エラー時もローカルストレージから読み込み
      console.warn('Error loading mission sheets:', err)
      const storedData = LocalStorageService.get<MissionSheetWithDetails[]>(STORAGE_KEY) || []
      setMissionSheets(storedData)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createMissionSheet = async (missionData: CreateMissionSheetRequest) => {
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<MissionSheetWithDetails[]>(STORAGE_KEY) || []

      const newMission: MissionSheetWithDetails = {
        id: `mission-${Date.now()}`,
        title: missionData.title || `${missionData.sport} ミッション`,
        description: missionData.description || '',
        student_id: missionData.student_id,
        coach_id: missionData.coach_id,
        lesson_date: missionData.lesson_date,
        school: missionData.school,
        sport: missionData.sport,
        status: 'draft',
        completion_rate: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        student: {
          id: missionData.student_id,
          name: '新規生徒',
          level: 1
        },
        coach: {
          id: missionData.coach_id,
          name: '講師'
        },
        mission_items: missionData.mission_items?.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          mission_sheet_id: `mission-${Date.now()}`,
          category: item.category,
          skill_item_id: item.skill_item_id,
          target_description: item.target_description,
          success_criteria: item.success_criteria,
          order_index: item.order_index || index,
          completed_at: null,
          completion_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })) || []
      }

      const updatedData = [newMission, ...storedData]
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchMissions() // リフレッシュ
      return newMission
    }

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
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<MissionSheetWithDetails[]>(STORAGE_KEY) || []
      const updatedData = storedData.map(mission =>
        mission.id === id
          ? { ...mission, ...missionData, updated_at: new Date().toISOString() }
          : mission
      )
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchMissions() // リフレッシュ
      return updatedData.find(m => m.id === id)
    }

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
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<MissionSheetWithDetails[]>(STORAGE_KEY) || []
      const updatedData = storedData.filter(mission => mission.id !== id)
      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchMissions() // リフレッシュ
      return { success: true }
    }

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
    // ローカルストレージモードの場合
    if (isLocalStorageMode()) {
      const storedData = LocalStorageService.get<MissionSheetWithDetails[]>(STORAGE_KEY) || []
      const updatedData = storedData.map(mission => {
        if (mission.mission_items) {
          const hasItem = mission.mission_items.some(item => item.id === itemId)
          if (hasItem) {
            const updatedItems = mission.mission_items.map(item =>
              item.id === itemId
                ? { ...item, ...itemData, updated_at: new Date().toISOString() }
                : item
            )

            // 完了率を再計算
            const completedCount = updatedItems.filter(item => item.completed_at).length
            const completion_rate = Math.round((completedCount / updatedItems.length) * 100)

            return {
              ...mission,
              mission_items: updatedItems,
              completion_rate,
              updated_at: new Date().toISOString()
            }
          }
        }
        return mission
      })

      LocalStorageService.set(STORAGE_KEY, updatedData)
      await fetchMissions() // リフレッシュ
      return { success: true }
    }

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

        // ローカルストレージモードの場合
        if (isLocalStorageMode()) {
          const storedData = LocalStorageService.get<MissionSheetWithDetails[]>(STORAGE_KEY) || []
          const found = storedData.find(m => m.id === id)
          setMissionSheet(found || null)
          setLoading(false)
          return
        }

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
        // エラー時はローカルストレージから取得
        const storedData = LocalStorageService.get<MissionSheetWithDetails[]>(STORAGE_KEY) || []
        const found = storedData.find(m => m.id === id)
        if (found) {
          setMissionSheet(found)
          setError(null)
        } else {
          setError(err instanceof Error ? err.message : 'ミッションシートの取得に失敗しました')
        }
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