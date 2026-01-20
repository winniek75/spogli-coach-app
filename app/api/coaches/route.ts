import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateCoachRequest } from '@/types/coach'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: coaches, error } = await supabase
      .from('coaches')
      .select(`
        *,
        certifications (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching coaches:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ coaches })
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
    const body: CreateCoachRequest = await request.json()

    // バリデーション
    if (!body.name || !body.email || !body.schools || body.schools.length === 0) {
      return NextResponse.json(
        { error: '名前、メールアドレス、担当校舎は必須項目です' },
        { status: 400 }
      )
    }

    const { data: coach, error } = await supabase
      .from('coaches')
      .insert({
        name: body.name,
        name_en: body.name_en,
        email: body.email,
        phone: body.phone,
        line_id: body.line_id,
        nationality: body.nationality,
        languages: body.languages || [],
        role: body.role || 'coach',
        schools: body.schools,
        hire_date: body.hire_date,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating coach:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ coach }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}