'use client'

import { useState, useEffect } from 'react'
import { Student, StudentWithDetails, CreateStudentRequest, UpdateStudentRequest } from '@/types/student'
import { LocalStorageService, isLocalStorageMode, initializeData } from '@/lib/local-storage'

// シードデータなし（実データのみで管理）
const seedStudentsData: StudentWithDetails[] = []

const STORAGE_KEY = 'students'

// ヘルパー関数
function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: 'Starter',
    2: 'Challenger',
    3: 'Adventurer',
    4: 'Explorer',
    5: 'Master'
  }
  return titles[level] || 'Unknown'
}

export function useStudents() {
  const [students, setStudents] = useState<StudentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async (filters?: {
    school?: string
    class_type?: string
    status?: string
    level?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        // 初回起動時はシードデータで初期化
        const storedData = initializeData(STORAGE_KEY, seedStudentsData)
        let filteredData = [...storedData]

        // フィルタリング
        if (filters) {
          if (filters.school) {
            filteredData = filteredData.filter(student => student.school === filters.school)
          }
          if (filters.class_type) {
            filteredData = filteredData.filter(student => student.class_type === filters.class_type)
          }
          if (filters.status) {
            filteredData = filteredData.filter(student => student.status === filters.status)
          }
          if (filters.level) {
            filteredData = filteredData.filter(student => student.level === parseInt(filters.level))
          }
        }

        setStudents(filteredData)
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
      }

      const url = `/api/students${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students')
      }

      console.log('API Response - Students:', data.students)
      setStudents(data.students || [])
    } catch (err) {
      // エラー時もシードデータにフォールバック
      console.warn('API failed, using seed data:', err)
      const storedData = initializeData(STORAGE_KEY, seedStudentsData)
      setStudents(storedData)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createStudent = async (studentData: CreateStudentRequest) => {
    try {
      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = LocalStorageService.get<StudentWithDetails[]>(STORAGE_KEY) || []

        const newStudent: StudentWithDetails = {
          ...studentData,
          id: `student-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          age: calculateAge(studentData.birth_date),
          level_title: getLevelTitle(studentData.level),
          latest_evaluations: [],
          badges: [],
          attendance_rate: 0
        }

        const updatedData = [...storedData, newStudent]
        LocalStorageService.set(STORAGE_KEY, updatedData)
        await fetchStudents() // リフレッシュ
        return newStudent
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student')
      }

      await fetchStudents() // リフレッシュ
      return data.student
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '生徒の登録に失敗しました')
    }
  }

  const updateStudent = async (id: string, studentData: UpdateStudentRequest) => {
    try {
      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = LocalStorageService.get<StudentWithDetails[]>(STORAGE_KEY) || []

        const updatedData = storedData.map(student => {
          if (student.id === id) {
            return {
              ...student,
              ...studentData,
              updated_at: new Date().toISOString(),
              age: studentData.birth_date ? calculateAge(studentData.birth_date) : student.age,
              level_title: studentData.level ? getLevelTitle(studentData.level) : student.level_title
            }
          }
          return student
        })

        LocalStorageService.set(STORAGE_KEY, updatedData)
        await fetchStudents() // リフレッシュ
        return updatedData.find(s => s.id === id)
      }

      const response = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student')
      }

      await fetchStudents() // リフレッシュ
      return data.student
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '生徒の更新に失敗しました')
    }
  }

  const withdrawStudent = async (id: string, reason?: string) => {
    try {
      // ローカルストレージモードの場合
      if (isLocalStorageMode()) {
        const storedData = LocalStorageService.get<StudentWithDetails[]>(STORAGE_KEY) || []

        // ステータスを'withdrawn'に変更（完全削除はしない）
        const updatedData = storedData.map(student => {
          if (student.id === id) {
            return {
              ...student,
              status: 'withdrawn' as const,
              updated_at: new Date().toISOString()
            }
          }
          return student
        })

        LocalStorageService.set(STORAGE_KEY, updatedData)
        await fetchStudents() // リフレッシュ
        return { success: true }
      }

      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to withdraw student')
      }

      await fetchStudents() // リフレッシュ
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '生徒の退会処理に失敗しました')
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    withdrawStudent,
  }
}

export function useStudent(id: string) {
  const [student, setStudent] = useState<StudentWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/students/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch student')
        }

        setStudent(data.student)
      } catch (err) {
        setError(err instanceof Error ? err.message : '生徒の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStudent()
    }
  }, [id])

  return { student, loading, error }
}