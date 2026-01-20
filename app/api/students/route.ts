import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateStudentRequest } from '@/types/student'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const school = searchParams.get('school')
    const classType = searchParams.get('class_type')
    const status = searchParams.get('status')
    const level = searchParams.get('level')

    let query = supabase
      .from('students')
      .select(`
        *,
        evaluations!evaluations_student_id_fkey (
          id,
          lesson_date,
          rating,
          sport,
          category,
          created_at
        ),
        badges!badges_student_id_fkey (
          id,
          sport,
          category,
          badge_type,
          earned_date,
          ceremony_completed
        ),
        attendance!attendance_student_id_fkey (
          id,
          lesson_date,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (school) {
      query = query.eq('school', school)
    }

    if (classType) {
      query = query.eq('class_type', classType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (level) {
      query = query.eq('level', parseInt(level))
    }

    const { data: students, error } = await query

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 年齢とレベルタイトルを計算
    const studentsWithDetails = students?.map(student => {
      const birthDate = new Date(student.birth_date)
      const today = new Date()
      const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

      // レベルタイトル
      const levelTitles = {
        1: 'Rookie', 2: 'Challenger', 3: 'Adventurer',
        4: 'Explorer', 5: 'Champion', 6: 'Master'
      }
      const level_title = levelTitles[student.level as keyof typeof levelTitles] || 'Unknown'

      // 出席率計算
      const totalAttendance = student.attendance?.length || 0
      const presentCount = student.attendance?.filter((a: any) => a.status === 'present').length || 0
      const attendance_rate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

      return {
        ...student,
        age,
        level_title,
        attendance_rate,
        latest_evaluations: student.evaluations?.slice(0, 5) || [],
      }
    }) || []

    return NextResponse.json({ students: studentsWithDetails })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CreateStudentRequest = await request.json()

    // バリデーション
    if (!body.name || !body.birth_date || !body.enrollment_date ||
        !body.school || !body.class_type || !body.parent_name) {
      return NextResponse.json(
        { error: '名前、生年月日、入会日、校舎、クラス種別、保護者名は必須項目です' },
        { status: 400 }
      )
    }

    // 年齢に基づく自動レベル設定
    const birthDate = new Date(body.birth_date)
    const today = new Date()
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

    let defaultLevel = 1
    if (age >= 3 && age < 4) defaultLevel = 1
    else if (age >= 4 && age < 5) defaultLevel = 2
    else if (age >= 5 && age < 6) defaultLevel = 3
    else if (age >= 6 && age < 7) defaultLevel = 4
    else if (age >= 7) defaultLevel = 5

    const { data: student, error } = await supabase
      .from('students')
      .insert({
        name: body.name,
        name_kana: body.name_kana,
        name_en: body.name_en,
        birth_date: body.birth_date,
        gender: body.gender,
        level: body.level || defaultLevel,
        enrollment_date: body.enrollment_date,
        school: body.school,
        class_type: body.class_type,
        parent_name: body.parent_name,
        parent_email: body.parent_email,
        parent_phone: body.parent_phone,
        line_id: body.line_id,
        emergency_contact: body.emergency_contact,
        medical_notes: body.medical_notes,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating student:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}