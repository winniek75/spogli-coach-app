'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  LessonMenu,
  LessonMenuWithDetails,
  CreateLessonMenuRequest,
  UpdateLessonMenuRequest,
  WeekType,
  SportMenuGroup,
  LessonMenusByWeek
} from '@/types/lesson-menu'
import { LocalStorageService, isLocalStorageMode, initializeData } from '@/lib/local-storage'

// シードデータ（初期データ）
const seedLessonMenus: LessonMenuWithDetails[] = [
  {
    id: 'menu-1',
    title: 'バレーボール基礎練習',
    description: '両手キャッチとアンダーハンドパスの基本を学ぶ',
    sport: 'volleyball',
    class_type: 'preschool',
    week_type: 'week1',
    month: '2025-02',
    level: 1,
    duration_minutes: 50,
    max_participants: 20,
    equipment: ['バレーボール', 'ネット', 'コーン'],
    objectives: ['ボールキャッチの基本', 'アンダーハンドパスの習得'],
    activities: [
      {
        id: 'act-1',
        lesson_menu_id: 'menu-1',
        name: 'ウォーミングアップ',
        description: 'ジョギングとストレッチ',
        duration_minutes: 8,
        activity_type: 'warmup',
        order_index: 1
      },
      {
        id: 'act-2',
        lesson_menu_id: 'menu-1',
        name: 'ボールキャッチ練習',
        description: '両手でボールをキャッチする練習',
        duration_minutes: 15,
        activity_type: 'technical_drill',
        equipment: ['バレーボール'],
        order_index: 2
      },
      {
        id: 'act-3',
        lesson_menu_id: 'menu-1',
        name: 'アンダーハンドパス',
        description: 'ペアでアンダーハンドパスの練習',
        duration_minutes: 20,
        activity_type: 'technical_drill',
        equipment: ['バレーボール'],
        order_index: 3
      },
      {
        id: 'act-4',
        lesson_menu_id: 'menu-1',
        name: 'クールダウン',
        description: 'ストレッチと振り返り',
        duration_minutes: 7,
        activity_type: 'cooldown',
        order_index: 4
      }
    ],
    english_phrases: ['Catch!', 'Ready!', 'Good job!', 'Nice try!'],
    is_public: true,
    is_template: true,
    created_by: 'system',
    created_at: '2025-01-15',
    updated_at: '2025-01-18'
  },
  {
    id: 'menu-2',
    title: 'バレーボール サーブ練習',
    description: 'アンダーハンドサーブの基本',
    sport: 'volleyball',
    class_type: 'preschool',
    week_type: 'week2',
    month: '2025-02',
    level: 1,
    duration_minutes: 50,
    max_participants: 20,
    equipment: ['バレーボール', 'ネット'],
    objectives: ['サーブの基本姿勢', 'アンダーハンドサーブ'],
    activities: [],
    english_phrases: ['Serve!', 'Over the net!'],
    is_public: true,
    is_template: true,
    created_by: 'system',
    created_at: '2025-01-16',
    updated_at: '2025-01-16'
  },
  {
    id: 'menu-3',
    title: 'バスケットボール ドリブル基礎',
    description: 'ドリブルの基本技術を学ぶ',
    sport: 'basketball',
    class_type: 'elementary',
    week_type: 'week1',
    month: '2025-02',
    level: 2,
    duration_minutes: 50,
    max_participants: 20,
    equipment: ['バスケットボール', 'コーン'],
    objectives: ['ドリブルの基本', 'ボールコントロール'],
    activities: [],
    english_phrases: ['Dribble!', 'Control!'],
    is_public: true,
    is_template: true,
    created_by: 'system',
    created_at: '2025-01-17',
    updated_at: '2025-01-17'
  },
  {
    id: 'menu-4',
    title: 'サッカー パス練習',
    description: 'インサイドパスとコントロール',
    sport: 'soccer',
    class_type: 'preschool',
    week_type: 'week1',
    month: '2025-02',
    level: 1,
    duration_minutes: 50,
    max_participants: 20,
    equipment: ['サッカーボール', 'コーン', 'ゴール'],
    objectives: ['インサイドパスの習得', 'ボールコントロール'],
    activities: [],
    english_phrases: ['Pass!', 'Control!', 'Shoot!'],
    is_public: true,
    is_template: true,
    created_by: 'system',
    created_at: '2025-01-18',
    updated_at: '2025-01-18'
  },
  {
    id: 'menu-5',
    title: 'サッカー シュート練習',
    description: 'シュートの基本技術',
    sport: 'soccer',
    class_type: 'preschool',
    week_type: 'week3',
    month: '2025-02',
    level: 1,
    duration_minutes: 50,
    max_participants: 20,
    equipment: ['サッカーボール', 'ゴール'],
    objectives: ['シュートフォーム', '狙った場所に蹴る'],
    activities: [],
    english_phrases: ['Shoot!', 'Goal!'],
    is_public: true,
    is_template: true,
    created_by: 'system',
    created_at: '2025-01-19',
    updated_at: '2025-01-19'
  }
]

const STORAGE_KEY = 'lesson_menus'

export function useLessonMenus() {
  const [lessonMenus, setLessonMenus] = useState<LessonMenuWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchLessonMenus = async (filters?: {
    sport?: string
    class_type?: 'preschool' | 'elementary'
    week_type?: WeekType
    month?: string
    level?: number
    search?: string
    is_public?: boolean
    is_template?: boolean
    limit?: number
    offset?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        // 初回起動時はシードデータで初期化
        const storedData = initializeData(STORAGE_KEY, seedLessonMenus)
        let filteredData = [...storedData]

        // フィルタリング
        if (filters) {
          if (filters.sport) {
            filteredData = filteredData.filter(menu => menu.sport === filters.sport)
          }
          if (filters.class_type) {
            filteredData = filteredData.filter(menu => menu.class_type === filters.class_type)
          }
          if (filters.week_type) {
            filteredData = filteredData.filter(menu => menu.week_type === filters.week_type)
          }
          if (filters.month) {
            filteredData = filteredData.filter(menu => menu.month === filters.month)
          }
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            filteredData = filteredData.filter(menu =>
              menu.title.toLowerCase().includes(searchTerm) ||
              menu.description?.toLowerCase().includes(searchTerm)
            )
          }
        }

        setLessonMenus(filteredData)
        setTotal(filteredData.length)
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

      const url = `/api/lesson-menus${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch lesson menus')
      }

      setLessonMenus(data.lessonMenus)
      setTotal(data.total)
    } catch (err) {
      // エラー時もシードデータにフォールバック
      console.warn('API failed, using seed data:', err)
      const storedData = initializeData(STORAGE_KEY, seedLessonMenus)
      setLessonMenus(storedData)
      setTotal(storedData.length)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createLessonMenu = async (menuData: CreateLessonMenuRequest) => {
    try {
      const response = await fetch('/api/lesson-menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lesson menu')
      }

      await fetchLessonMenus() // リフレッシュ
      return data.lessonMenu
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'レッスンメニューの作成に失敗しました')
    }
  }

  const updateLessonMenu = async (id: string, menuData: UpdateLessonMenuRequest) => {
    try {
      const response = await fetch(`/api/lesson-menus/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lesson menu')
      }

      await fetchLessonMenus() // リフレッシュ
      return data.lessonMenu
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'レッスンメニューの更新に失敗しました')
    }
  }

  const deleteLessonMenu = async (id: string) => {
    try {
      const response = await fetch(`/api/lesson-menus/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete lesson menu')
      }

      await fetchLessonMenus() // リフレッシュ
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'レッスンメニューの削除に失敗しました')
    }
  }

  const shareLessonMenu = async (id: string, shareData: {
    emails: string[]
    message?: string
    expires_days?: number
  }) => {
    try {
      const response = await fetch(`/api/lesson-menus/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share lesson menu')
      }

      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'レッスンメニューの共有に失敗しました')
    }
  }

  // スポーツと週でグループ化したメニューを返す
  const groupedMenus = useMemo(() => {
    const groups: SportMenuGroup[] = []

    // スポーツとクラスタイプと月でグループ化
    const menuMap = new Map<string, LessonMenusByWeek>()

    lessonMenus.forEach(menu => {
      const key = `${menu.sport}-${menu.class_type}-${menu.month}`
      if (!menuMap.has(key)) {
        menuMap.set(key, {})
      }
      const group = menuMap.get(key)!
      if (menu.week_type) {
        group[menu.week_type] = menu
      }
    })

    // SportMenuGroup配列に変換
    menuMap.forEach((menus, key) => {
      const [sport, classType, month] = key.split('-')
      const sportNames: Record<string, string> = {
        volleyball: 'バレーボール',
        basketball: 'バスケットボール',
        soccer: 'サッカー',
        tennis: 'テニス',
        rugby: 'ラグビー',
        baseball: '野球'
      }

      groups.push({
        sport,
        sportName: sportNames[sport] || sport,
        class_type: classType as 'preschool' | 'elementary',
        month,
        menus
      })
    })

    return groups
  }, [lessonMenus])

  useEffect(() => {
    fetchLessonMenus()
  }, [])

  return {
    lessonMenus,
    groupedMenus,
    loading,
    error,
    total,
    fetchLessonMenus,
    createLessonMenu,
    updateLessonMenu,
    deleteLessonMenu,
    shareLessonMenu,
  }
}

export function useLessonMenu(id: string) {
  const [lessonMenu, setLessonMenu] = useState<LessonMenuWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessonMenu = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/lesson-menus/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch lesson menu')
        }

        setLessonMenu(data.lessonMenu)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'レッスンメニューの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchLessonMenu()
  }, [id])

  return { lessonMenu, loading, error }
}