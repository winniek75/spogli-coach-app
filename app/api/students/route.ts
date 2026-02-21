import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateStudentRequest, StudentWithDetails } from '@/types/student'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const school = searchParams.get('school')
    const classType = searchParams.get('class_type')
    const status = searchParams.get('status')
    const level = searchParams.get('level')

    // Supabaseから生徒データを取得
    let query = supabase
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
      .order('created_at', { ascending: false })

    // フィルタリング
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
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      )
    }

    // データの整形
    const formattedStudents: StudentWithDetails[] = (students || []).map(student => {
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

      return {
        ...student,
        age,
        level_title: levelTitle,
        attendance_rate: attendanceRate,
        badges: student.badges || [],
        evaluations: student.evaluations || [],
        latest_evaluations: latestEvaluations,
      }
    })

    return NextResponse.json({ students: formattedStudents })
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

    // 一時的に認証チェックを無効化（開発環境のみ）
    // TODO: 本番環境では認証を有効にする
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

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

    // Supabaseに生徒データを保存
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert([
        {
          name: body.name,
          name_kana: body.name_kana || '',
          name_en: body.name_en || '',
          birth_date: body.birth_date,
          gender: body.gender || 'other',
          photo_url: body.photo_url || null,
          level: body.level || defaultLevel,
          enrollment_date: body.enrollment_date,
          school: body.school,
          class_type: body.class_type,
          parent_name: body.parent_name,
          parent_email: body.parent_email || '',
          parent_phone: body.parent_phone || '',
          emergency_contact: body.emergency_contact || null,
          medical_notes: body.medical_notes || null,
          notes: body.notes || null,
          status: 'active',
          created_by: null // 一時的にnullを設定
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      )
    }

    // データの整形
    const levelTitles = ['Rookie', 'Challenger', 'Adventurer', 'Explorer', 'Champion', 'Master']
    const levelTitle = levelTitles[(newStudent.level || defaultLevel) - 1]

    const formattedStudent: StudentWithDetails = {
      ...newStudent,
      age,
      level_title: levelTitle,
      attendance_rate: 100,
      badges: [],
      evaluations: [],
      latest_evaluations: []
    }

    return NextResponse.json({ student: formattedStudent }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}