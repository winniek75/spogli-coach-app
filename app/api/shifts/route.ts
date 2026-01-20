import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateShiftRequest } from '@/types/schedule'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const coachId = searchParams.get('coach_id')
    const date = searchParams.get('date')
    const school = searchParams.get('school')

    let query = supabase
      .from('coach_shifts')
      .select(`
        *,
        coach:coaches!coach_shifts_coach_id_fkey (
          id,
          name,
          name_en
        )
      `)
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (coachId) {
      query = query.eq('coach_id', coachId)
    }

    if (date) {
      query = query.eq('shift_date', date)
    }

    if (school) {
      query = query.eq('school', school)
    }

    const { data: shifts, error } = await query

    if (error) {
      console.error('Error fetching shifts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ shifts })
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
    const body: CreateShiftRequest = await request.json()

    // バリデーション
    if (!body.coach_id || !body.shift_date || !body.start_time || !body.end_time || !body.school) {
      return NextResponse.json(
        { error: '講師ID、日付、開始時刻、終了時刻、校舎は必須項目です' },
        { status: 400 }
      )
    }

    // 時刻の妥当性チェック
    if (body.start_time >= body.end_time) {
      return NextResponse.json(
        { error: '開始時刻は終了時刻より前である必要があります' },
        { status: 400 }
      )
    }

    const { data: shift, error } = await supabase
      .from('coach_shifts')
      .insert({
        coach_id: body.coach_id,
        shift_date: body.shift_date,
        start_time: body.start_time,
        end_time: body.end_time,
        school: body.school,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating shift:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}