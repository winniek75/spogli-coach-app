import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
interface RouteParams {
  params: { id: string }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // バッジを授与済みにマーク
    const { data: badge, error } = await supabase
      .from('badges')
      .update({
        awarded_date: body.awarded_date || new Date().toISOString().split('T')[0],
        ceremony_completed: body.ceremony_completed || false,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select(`
        *,
        student:students!badges_student_id_fkey (
          id,
          name,
          level
        )
      `)
      .single()

    if (error) {
      console.error('Error awarding badge:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!badge) {
      return NextResponse.json({ error: 'バッジが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ badge })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}