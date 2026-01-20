import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const studentId = searchParams.get('student_id')
    const lessonDate = searchParams.get('lesson_date')
    const status = searchParams.get('status')
    const school = searchParams.get('school')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('attendance')
      .select(`
        *,
        student:students!attendance_student_id_fkey (
          id,
          name,
          level,
          school,
          class_type
        )
      `)
      .order('lesson_date', { ascending: false })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (lessonDate) {
      query = query.eq('lesson_date', lessonDate)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (school) {
      query = query.eq('school', school)
    }

    if (startDate) {
      query = query.gte('lesson_date', startDate)
    }

    if (endDate) {
      query = query.lte('lesson_date', endDate)
    }

    const { data: attendance, error } = await query

    if (error) {
      console.error('Error fetching attendance:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ attendance })
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
    const body = await request.json()

    // バリデーション
    if (!body.student_id || !body.lesson_date || !body.status || !body.school) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    if (!['present', 'absent', 'late'].includes(body.status)) {
      return NextResponse.json(
        { error: '不正な出席ステータスです' },
        { status: 400 }
      )
    }

    // 重複チェック
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', body.student_id)
      .eq('lesson_date', body.lesson_date)
      .single()

    if (existingRecord) {
      // 既存レコードを更新
      const { data: attendance, error } = await supabase
        .from('attendance')
        .update({
          status: body.status,
          notes: body.notes,
          school: body.school,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRecord.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating attendance:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ attendance })
    } else {
      // 新規作成
      const { data: attendance, error } = await supabase
        .from('attendance')
        .insert({
          student_id: body.student_id,
          lesson_date: body.lesson_date,
          status: body.status,
          notes: body.notes,
          school: body.school,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating attendance:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ attendance }, { status: 201 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 一括出席記録
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.records || !Array.isArray(body.records)) {
      return NextResponse.json(
        { error: '出席記録データが不正です' },
        { status: 400 }
      )
    }

    const results = []

    for (const record of body.records) {
      if (!record.student_id || !record.lesson_date || !record.status) {
        continue // 無効なレコードはスキップ
      }

      // 重複チェック
      const { data: existingRecord } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', record.student_id)
        .eq('lesson_date', record.lesson_date)
        .single()

      if (existingRecord) {
        // 更新
        const { data: attendance, error } = await supabase
          .from('attendance')
          .update({
            status: record.status,
            notes: record.notes,
            school: record.school || 'ageo',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id)
          .select()
          .single()

        if (!error) {
          results.push(attendance)
        }
      } else {
        // 新規作成
        const { data: attendance, error } = await supabase
          .from('attendance')
          .insert({
            student_id: record.student_id,
            lesson_date: record.lesson_date,
            status: record.status,
            notes: record.notes,
            school: record.school || 'ageo',
          })
          .select()
          .single()

        if (!error) {
          results.push(attendance)
        }
      }
    }

    return NextResponse.json({
      attendance: results,
      processed: results.length,
      total: body.records.length
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}