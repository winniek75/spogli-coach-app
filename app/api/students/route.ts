import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateStudentRequest, StudentWithDetails } from '@/types/student'
export const dynamic = 'force-dynamic'

// デモデータ
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

export async function GET(request: NextRequest) {
  try {
    // デモモード: Supabaseが設定されていない場合はデモデータを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      // デモモード: フィルタリング処理
      const { searchParams } = new URL(request.url)
      const school = searchParams.get('school')
      const classType = searchParams.get('class_type')
      const status = searchParams.get('status')
      const level = searchParams.get('level')

      let filteredStudents = [...demoStudents]

      if (school) {
        filteredStudents = filteredStudents.filter(s => s.school === school)
      }

      if (classType) {
        filteredStudents = filteredStudents.filter(s => s.class_type === classType)
      }

      if (status) {
        filteredStudents = filteredStudents.filter(s => s.status === status)
      }

      if (level) {
        filteredStudents = filteredStudents.filter(s => s.level === parseInt(level))
      }

      return NextResponse.json({ students: filteredStudents })
    }

    // 本番モード: Supabaseからデータを取得
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