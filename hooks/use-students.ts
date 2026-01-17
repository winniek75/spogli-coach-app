'use client'

import { useState, useEffect } from 'react'
import { Student, StudentWithDetails, CreateStudentRequest, UpdateStudentRequest } from '@/types/student'

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

      setStudents(data.students)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生徒の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createStudent = async (studentData: CreateStudentRequest) => {
    try {
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