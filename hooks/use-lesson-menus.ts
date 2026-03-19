'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  LessonMenuWithDetails,
  CreateLessonMenuRequest,
  UpdateLessonMenuRequest,
  WeekType,
  SportMenuGroup,
  LessonMenusByWeek
} from '@/types/lesson-menu'
import { LocalStorageService } from '@/lib/local-storage'

const STORAGE_KEY = 'lesson_menus'

export function useLessonMenus() {
  const [lessonMenus, setLessonMenus] = useState<LessonMenuWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchLessonMenus = (filters?: {
    sport?: string
    class_type?: 'preschool' | 'elementary'
    week_type?: WeekType
    month?: string
    search?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const storedData = LocalStorageService.get<LessonMenuWithDetails[]>(STORAGE_KEY) || []
      let filteredData = [...storedData]

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
    } catch (err) {
      console.error('レッスンメニューの取得に失敗:', err)
      setLessonMenus([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const createLessonMenu = (menuData: CreateLessonMenuRequest) => {
    const storedData = LocalStorageService.get<LessonMenuWithDetails[]>(STORAGE_KEY) || []
    const newMenu: LessonMenuWithDetails = {
      id: `menu-${Date.now()}`,
      title: menuData.title,
      description: menuData.description,
      sport: menuData.sport,
      class_type: menuData.class_type,
      week_type: menuData.week_type,
      month: menuData.month,
      level: menuData.level || 1,
      duration_minutes: menuData.duration_minutes,
      max_participants: menuData.max_participants || 20,
      equipment: menuData.equipment || [],
      objectives: menuData.objectives || [],
      activities: [],
      english_phrases: menuData.english_phrases || [],
      is_public: true,
      is_template: false,
      created_by: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedData = [...storedData, newMenu]
    LocalStorageService.set(STORAGE_KEY, updatedData)
    setLessonMenus(updatedData)
    setTotal(updatedData.length)
    return newMenu
  }

  const updateLessonMenu = (id: string, menuData: UpdateLessonMenuRequest) => {
    const storedData = LocalStorageService.get<LessonMenuWithDetails[]>(STORAGE_KEY) || []
    const updatedData = storedData.map(menu =>
      menu.id === id ? { ...menu, ...menuData, updated_at: new Date().toISOString() } : menu
    )
    LocalStorageService.set(STORAGE_KEY, updatedData)
    setLessonMenus(updatedData)
  }

  const deleteLessonMenu = (id: string) => {
    const storedData = LocalStorageService.get<LessonMenuWithDetails[]>(STORAGE_KEY) || []
    const updatedData = storedData.filter(menu => menu.id !== id)
    LocalStorageService.set(STORAGE_KEY, updatedData)
    setLessonMenus(updatedData)
    setTotal(updatedData.length)
  }

  // スポーツと週でグループ化したメニューを返す
  const groupedMenus = useMemo(() => {
    const groups: SportMenuGroup[] = []
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

    menuMap.forEach((menus, key) => {
      const [sport, classType, month] = key.split('-')
      const sportNames: Record<string, string> = {
        volleyball: 'バレーボール',
        basketball: 'バスケットボール',
        soccer: 'サッカー',
        tennis: 'テニス',
        tag_rugby: 'タグラグビー',
        baseball: '野球',
        badminton: 'バドミントン',
        dance: 'ダンス',
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
  }
}

export function useLessonMenu(id: string) {
  const [lessonMenu, setLessonMenu] = useState<LessonMenuWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    try {
      const storedData = LocalStorageService.get<LessonMenuWithDetails[]>(STORAGE_KEY) || []
      const found = storedData.find(m => m.id === id) || null
      setLessonMenu(found)
    } catch (err) {
      setError('レッスンメニューの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [id])

  return { lessonMenu, loading, error }
}
