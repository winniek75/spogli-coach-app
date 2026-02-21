import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateStudentRequest, StudentWithDetails } from '@/types/student'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    // 一時的に認証チェックを無効化（開発環境のみ）
    // TODO: 本番環境では認証を有効にする
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    // Supabaseから生徒データを取得
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        *,
        badges:student_badges (*),
        evaluations:student_evaluations (
          id,
          lesson_date,
          rating,
          sport,
          category,
          created_at
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !student) {
      return NextResponse.json({ error: '生徒が見つかりません' }, { status: 404 })
    }

    // データの整形
    const birthDate = new Date(student.birth_date)
    const today = new Date()
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

    const levelTitles = ['Rookie', 'Challenger', 'Adventurer', 'Explorer', 'Champion', 'Master']
    const levelTitle = levelTitles[student.level - 1] || 'Rookie'

    // 最新の評価を取得
    const latestEvaluations = student.evaluations
      ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || []

    // 出席率の計算（仮実装：ランダム値）
    const attendanceRate = Math.floor(Math.random() * 20) + 80

    const formattedStudent: StudentWithDetails = {
      ...student,
      age,
      level_title: levelTitle,
      attendance_rate: attendanceRate,
      badges: student.badges || [],
      evaluations: student.evaluations || [],
      latest_evaluations: latestEvaluations,
    }

    return NextResponse.json({ student: formattedStudent })
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

    // 一時的に認証チェックを無効化（開発環境のみ）
    // TODO: 本番環境では認証を有効にする
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const body: UpdateStudentRequest = await request.json()

    // Supabaseで生徒データを更新
    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !updatedStudent) {
      console.error('Database error:', error)
      return NextResponse.json({ error: '生徒が見つかりません' }, { status: 404 })
    }

    // データの整形
    const birthDate = new Date(updatedStudent.birth_date)
    const today = new Date()
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

    const levelTitles = ['Rookie', 'Challenger', 'Adventurer', 'Explorer', 'Champion', 'Master']
    const levelTitle = levelTitles[updatedStudent.level - 1] || 'Rookie'

    const formattedStudent: StudentWithDetails = {
      ...updatedStudent,
      age,
      level_title: levelTitle,
      attendance_rate: Math.floor(Math.random() * 20) + 80,
      badges: [],
      evaluations: [],
      latest_evaluations: []
    }

    return NextResponse.json({ student: formattedStudent })
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

    // 一時的に認証チェックを無効化（開発環境のみ）
    // TODO: 本番環境では認証を有効にする
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    // ステータスを'withdrawn'に更新（論理削除）
    const { data, error } = await supabase
      .from('students')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !data) {
      console.error('Database error:', error)
      return NextResponse.json({ error: '生徒が見つかりません' }, { status: 404 })
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