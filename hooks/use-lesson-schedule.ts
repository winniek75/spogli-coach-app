'use client'

import { useState, useEffect } from 'react'
import { LocalStorageService, isLocalStorageMode } from '@/lib/local-storage'

// データベース用の型
interface DatabaseLesson {
  id: string
  lesson_date: string
  start_time: string
  end_time: string
  school: string
  class_type: string
  sport: string
  training_type: string
  assigned_coach_ids: string[]
  max_students: number
  status: string
  notes?: string
  lesson_menu_id?: string
  created_at?: string
  updated_at?: string
}

// UIで使用する型
export interface LessonSchedule {
  id: string
  date: string
  startTime: string
  endTime: string
  school: 'ageo' | 'okegawa'
  classType: 'preschool' | 'elementary'
  sport: string
  trainingType: string
  assignedCoaches: string[]
  maxStudents: number
  enrolledCount: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  lessonMenu: string | null
  notes?: string
}

// シードデータなし（実データのみで管理）
const STORAGE_KEY = 'lesson_schedules'

// データベース⇄UI変換ヘルパー関数
const convertDatabaseToUI = (dbLesson: DatabaseLesson, coachNames: { [id: string]: string } = {}): LessonSchedule => {
  return {
    id: dbLesson.id,
    date: dbLesson.lesson_date,
    startTime: dbLesson.start_time,
    endTime: dbLesson.end_time,
    school: dbLesson.school as 'ageo' | 'okegawa',
    classType: dbLesson.class_type as 'preschool' | 'elementary',
    sport: dbLesson.sport,
    trainingType: dbLesson.training_type,
    assignedCoaches: dbLesson.assigned_coach_ids.map(id => coachNames[id] || id),
    maxStudents: dbLesson.max_students,
    enrolledCount: 0, // TODO: 実際の出席数を取得する
    status: dbLesson.status as any,
    lessonMenu: null, // TODO: レッスンメニューテーブルと連携
    notes: dbLesson.notes
  }
}

const convertUIToDatabase = (lesson: Omit<LessonSchedule, 'id'>, coachIds: { [name: string]: string } = {}): Omit<DatabaseLesson, 'id' | 'created_at' | 'updated_at'> => {
  return {
    lesson_date: lesson.date,
    start_time: lesson.startTime,
    end_time: lesson.endTime,
    school: lesson.school,
    class_type: lesson.classType,
    sport: lesson.sport,
    training_type: lesson.trainingType,
    assigned_coach_ids: lesson.assignedCoaches.map(name => coachIds[name] || name),
    max_students: lesson.maxStudents,
    status: lesson.status,
    notes: lesson.notes
  }
}

export function useLessonSchedule() {
  const [lessons, setLessons] = useState<LessonSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [coachNames, setCoachNames] = useState<{ [id: string]: string }>({})
  const [coachIds, setCoachIds] = useState<{ [name: string]: string }>({})

  // 講師情報を取得してマッピングを作成
  const loadCoachMappings = async () => {
    if (isLocalStorageMode()) {
      const coaches = LocalStorageService.get<any[]>('coaches') || []
      const nameMap: { [id: string]: string } = {}
      const idMap: { [name: string]: string } = {}
      coaches.forEach(coach => {
        nameMap[coach.id] = coach.name
        idMap[coach.name] = coach.id
      })
      setCoachNames(nameMap)
      setCoachIds(idMap)
      return
    }

    try {
      const response = await fetch('/api/coaches')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const nameMap: { [id: string]: string } = {}
      const idMap: { [name: string]: string } = {}
      data.coaches.forEach((coach: any) => {
        nameMap[coach.id] = coach.name
        idMap[coach.name] = coach.id
      })
      setCoachNames(nameMap)
      setCoachIds(idMap)
    } catch (error) {
      console.error('講師情報の取得に失敗:', error)
    }
  }

  // レッスンを読み込む
  const loadLessonsFromDatabase = async () => {
    setLoading(true)
    try {
      if (isLocalStorageMode()) {
        const storedLessons = LocalStorageService.get<LessonSchedule[]>(STORAGE_KEY) || []
        setLessons(storedLessons)
        setLoading(false)
        return
      }

      const response = await fetch('/api/lesson-schedules')
      const data = await response.json()

      if (!response.ok) {
        console.error('レッスンデータの取得に失敗:', data.error)
        const storedLessons = LocalStorageService.get<LessonSchedule[]>(STORAGE_KEY) || []
        setLessons(storedLessons)
        return
      }

      const convertedLessons = data.lessons.map((dbLesson: DatabaseLesson) =>
        convertDatabaseToUI(dbLesson, coachNames)
      )
      setLessons(convertedLessons)
    } catch (error) {
      console.error('レッスンデータの取得エラー:', error)
      const storedLessons = LocalStorageService.get<LessonSchedule[]>(STORAGE_KEY) || []
      setLessons(storedLessons)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoachMappings()
  }, [])

  useEffect(() => {
    loadLessonsFromDatabase()
  }, [coachNames])

  // デフォルトレッスンを生成（現在は使用しない - 実データのみ）
  const generateDefaultLessons = () => {
    // 実データのみで管理するため、デフォルトレッスンは生成しない
    console.log('デフォルトレッスンの生成はスキップされました')
  }


  // レッスンを追加
  const addLesson = async (lesson: Omit<LessonSchedule, 'id'>) => {
    try {
      if (isLocalStorageMode()) {
        const storedLessons = LocalStorageService.get<LessonSchedule[]>(STORAGE_KEY) || []
        const newLesson: LessonSchedule = {
          ...lesson,
          id: `lesson-${Date.now()}`,
        }
        const updatedLessons = [...storedLessons, newLesson].sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) return dateCompare
          return a.startTime.localeCompare(b.startTime)
        })
        LocalStorageService.set(STORAGE_KEY, updatedLessons)
        setLessons(updatedLessons)
        return newLesson
      }

      const dbLesson = convertUIToDatabase(lesson, coachIds)
      const response = await fetch('/api/lesson-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbLesson),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const newLesson = convertDatabaseToUI(data.lesson, coachNames)
      setLessons(prev => [...prev, newLesson].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.startTime.localeCompare(b.startTime)
      }))

      return newLesson
    } catch (error) {
      console.error('レッスンの追加に失敗しました:', error)
      throw error
    }
  }

  // レッスンを更新
  const updateLesson = async (id: string, updates: Partial<LessonSchedule>) => {
    try {
      const currentLesson = lessons.find(l => l.id === id)
      if (!currentLesson) {
        throw new Error('レッスンが見つかりません')
      }

      if (isLocalStorageMode()) {
        const storedLessons = LocalStorageService.get<LessonSchedule[]>(STORAGE_KEY) || []
        const updatedLessons = storedLessons.map(lesson =>
          lesson.id === id ? { ...lesson, ...updates } : lesson
        )
        LocalStorageService.set(STORAGE_KEY, updatedLessons)
        setLessons(updatedLessons)
        return
      }

      const updatedLesson = { ...currentLesson, ...updates }
      const dbUpdates = convertUIToDatabase(updatedLesson, coachIds)

      const response = await fetch(`/api/lesson-schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbUpdates),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const convertedLesson = convertDatabaseToUI(data.lesson, coachNames)
      setLessons(prev => prev.map(lesson =>
        lesson.id === id ? convertedLesson : lesson
      ))
    } catch (error) {
      console.error('レッスンの更新に失敗しました:', error)
      throw error
    }
  }

  // レッスンを削除
  const deleteLesson = async (id: string) => {
    try {
      if (isLocalStorageMode()) {
        const storedLessons = LocalStorageService.get<LessonSchedule[]>(STORAGE_KEY) || []
        const updatedLessons = storedLessons.filter(lesson => lesson.id !== id)
        LocalStorageService.set(STORAGE_KEY, updatedLessons)
        setLessons(updatedLessons)
        return
      }

      const response = await fetch(`/api/lesson-schedules/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setLessons(prev => prev.filter(lesson => lesson.id !== id))
    } catch (error) {
      console.error('レッスンの削除に失敗しました:', error)
      throw error
    }
  }

  // 特定の日付のレッスンを取得
  const getLessonsByDate = (date: string) => {
    return lessons.filter(lesson => lesson.date === date)
  }

  // 特定の週のレッスンを取得
  const getLessonsByWeek = (startDate: Date) => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)

    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    return lessons.filter(lesson =>
      lesson.date >= startStr && lesson.date <= endStr
    )
  }

  // 講師が必要なレッスンを取得
  const getLessonsNeedingCoaches = () => {
    return lessons.filter(lesson =>
      lesson.assignedCoaches.length === 0 &&
      lesson.status === 'scheduled'
    )
  }

  return {
    lessons,
    loading,
    addLesson,
    updateLesson,
    deleteLesson,
    getLessonsByDate,
    getLessonsByWeek,
    getLessonsNeedingCoaches,
    generateDefaultLessons,
  }
}