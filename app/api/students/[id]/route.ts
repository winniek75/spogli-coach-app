import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateStudentRequest } from '@/types/student'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    const { data: student, error } = await supabase
      .from('students')
      .select(`
        *,
        evaluations!evaluations_student_id_fkey (
          id,
          lesson_date,
          coach_id,
          sport,
          category,
          skill_item_id,
          rating,
          notes,
          created_at,
          coaches!evaluations_coach_id_fkey (
            id,
            name
          )
        ),
        badges!badges_student_id_fkey (
          id,
          sport,
          category,
          badge_type,
          earned_date,
          awarded_date,
          ceremony_completed,
          notes
        ),
        attendance!attendance_student_id_fkey (
          id,
          lesson_date,
          status,
          created_at
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching student:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!student) {
      return NextResponse.json({ error: '生徒が見つかりません' }, { status: 404 })
    }

    // 年齢計算
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

    // 最新評価をソート
    const sortedEvaluations = student.evaluations?.sort((a: any, b: any) =>
      new Date(b.lesson_date).getTime() - new Date(a.lesson_date).getTime()
    ) || []

    const studentWithDetails = {
      ...student,
      age,
      level_title,
      attendance_rate,
      evaluations: sortedEvaluations,
    }

    return NextResponse.json({ student: studentWithDetails })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const body: UpdateStudentRequest = await request.json()

    const { data: student, error } = await supabase
      .from('students')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating student:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!student) {
      return NextResponse.json({ error: '生徒が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    // 論理削除（退会処理）
    const { error } = await supabase
      .from('students')
      .update({
        status: 'withdrawn',
        withdrawal_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error withdrawing student:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: '生徒を退会処理しました' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}