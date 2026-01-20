import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateStudentRequest, StudentWithDetails } from '@/types/student'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

// デモデータ（メインのroute.tsと同じ）
const demoStudents: StudentWithDetails[] = [
  {
    id: '1',
    name: '田中太郎',
    name_kana: 'たなか たろう',
    name_en: 'Taro Tanaka',
    birth_date: '2018-04-15',
    gender: 'male',
    photo_url: null,
    level: 3,
    enrollment_date: '2024-04-01',
    school: 'ageo',
    class_type: 'preschool',
    parent_name: '田中一郎',
    parent_email: 'tanaka@example.com',
    parent_phone: '090-1234-5678',
    emergency_contact: '080-9876-5432',
    medical_notes: 'アレルギー: なし',
    notes: '元気で活発な子です',
    status: 'active',
    age: 6,
    level_title: 'Adventurer',
    attendance_rate: 95,
    badges: [
      { id: '1', sport: 'soccer', category: 'basic', badge_type: 'star', earned_date: '2024-05-01', ceremony_completed: true }
    ],
    evaluations: [
      { id: '1', lesson_date: '2024-06-01', rating: 5, sport: 'soccer', category: 'basic', created_at: '2024-06-01' }
    ],
    latest_evaluations: [],
    created_at: '2024-04-01',
    updated_at: '2024-06-15'
  },
  {
    id: '2',
    name: '鈴木花子',
    name_kana: 'すずき はなこ',
    name_en: 'Hanako Suzuki',
    birth_date: '2017-08-20',
    gender: 'female',
    photo_url: null,
    level: 4,
    enrollment_date: '2024-03-15',
    school: 'okegawa',
    class_type: 'elementary',
    parent_name: '鈴木美香',
    parent_email: 'suzuki@example.com',
    parent_phone: '090-2345-6789',
    emergency_contact: '080-8765-4321',
    medical_notes: '喘息あり',
    notes: '集中力が高い',
    status: 'active',
    age: 7,
    level_title: 'Explorer',
    attendance_rate: 88,
    badges: [
      { id: '2', sport: 'basketball', category: 'advanced', badge_type: 'crown', earned_date: '2024-05-15', ceremony_completed: false }
    ],
    evaluations: [],
    latest_evaluations: [],
    created_at: '2024-03-15',
    updated_at: '2024-06-10'
  },
  {
    id: '3',
    name: '佐藤健太',
    name_kana: 'さとう けんた',
    name_en: 'Kenta Sato',
    birth_date: '2019-01-10',
    gender: 'male',
    photo_url: null,
    level: 2,
    enrollment_date: '2024-05-01',
    school: 'ageo',
    class_type: 'preschool',
    parent_name: '佐藤智子',
    parent_email: 'sato@example.com',
    parent_phone: '090-3456-7890',
    emergency_contact: null,
    medical_notes: null,
    notes: null,
    status: 'active',
    age: 5,
    level_title: 'Challenger',
    attendance_rate: 100,
    badges: [],
    evaluations: [],
    latest_evaluations: [],
    created_at: '2024-05-01',
    updated_at: '2024-06-01'
  }
]

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // デモモード: Supabaseが設定されていない場合はデモデータを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const student = demoStudents.find(s => s.id === params.id)

      if (!student) {
        return NextResponse.json({ error: '生徒が見つかりません' }, { status: 404 })
      }

      return NextResponse.json({ student })
    }

    // 本番モード: Supabaseからデータを取得
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
    // デモモード: 更新をシミュレート
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const body: UpdateStudentRequest = await request.json()
      const studentIndex = demoStudents.findIndex(s => s.id === params.id)

      if (studentIndex === -1) {
        return NextResponse.json({ error: '生徒が見つかりません' }, { status: 404 })
      }

      // デモモードでは実際には更新しないが、成功レスポンスを返す
      const updatedStudent = {
        ...demoStudents[studentIndex],
        ...body,
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({ student: updatedStudent })
    }

    // 本番モード: Supabaseでデータを更新
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
    // デモモード: 削除をシミュレート
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const student = demoStudents.find(s => s.id === params.id)

      if (!student) {
        return NextResponse.json({ error: '生徒が見つかりません' }, { status: 404 })
      }

      return NextResponse.json({ message: '生徒を退会処理しました' })
    }

    // 本番モード: Supabaseでデータを更新
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