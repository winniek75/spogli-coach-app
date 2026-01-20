import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const studentId = searchParams.get('student_id')
    const status = searchParams.get('status')
    const lessonDate = searchParams.get('lesson_date')

    let query = supabase
      .from('mission_sheets')
      .select(`
        *,
        student:students!mission_sheets_student_id_fkey (
          id,
          name,
          level
        ),
        coach:coaches!mission_sheets_coach_id_fkey (
          id,
          name
        )
      `)
      .order('lesson_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (lessonDate) {
      query = query.eq('lesson_date', lessonDate)
    }

    const { data: missionSheets, error } = await query

    if (error) {
      console.error('Error fetching mission sheets:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ missionSheets })
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
    if (!body.student_id || !body.lesson_date || !body.coach_id ||
        !body.school || !body.sport) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    if (!body.mission_items || !Array.isArray(body.mission_items) || body.mission_items.length === 0) {
      return NextResponse.json(
        { error: 'ミッション項目が設定されていません' },
        { status: 400 }
      )
    }

    // ミッションシートを作成
    const { data: missionSheet, error: sheetError } = await supabase
      .from('mission_sheets')
      .insert({
        student_id: body.student_id,
        coach_id: body.coach_id,
        lesson_date: body.lesson_date,
        school: body.school,
        sport: body.sport,
        title: body.title || `${body.sport} ミッション`,
        description: body.description,
        status: 'draft',
      })
      .select()
      .single()

    if (sheetError) {
      console.error('Error creating mission sheet:', sheetError)
      return NextResponse.json({ error: sheetError.message }, { status: 500 })
    }

    // ミッション項目を作成
    const missionItems = body.mission_items.map((item: any) => ({
      mission_sheet_id: missionSheet.id,
      category: item.category,
      skill_item_id: item.skill_item_id,
      target_description: item.target_description,
      success_criteria: item.success_criteria,
      order_index: item.order_index || 0,
    }))

    const { error: itemsError } = await supabase
      .from('mission_items')
      .insert(missionItems)

    if (itemsError) {
      console.error('Error creating mission items:', itemsError)
      // ミッションシートを削除してロールバック
      await supabase.from('mission_sheets').delete().eq('id', missionSheet.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json({ missionSheet }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}