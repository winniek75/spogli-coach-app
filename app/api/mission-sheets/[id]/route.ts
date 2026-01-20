import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    const { data: missionSheet, error } = await supabase
      .from('mission_sheets')
      .select(`
        *,
        student:students!mission_sheets_student_id_fkey (
          id,
          name,
          level,
          age
        ),
        coach:coaches!mission_sheets_coach_id_fkey (
          id,
          name
        ),
        mission_items!mission_items_mission_sheet_id_fkey (
          id,
          category,
          skill_item_id,
          target_description,
          success_criteria,
          completed_at,
          completion_notes,
          order_index
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching mission sheet:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!missionSheet) {
      return NextResponse.json({ error: 'ミッションシートが見つかりません' }, { status: 404 })
    }

    // ミッション項目をorder_indexでソート
    if (missionSheet.mission_items) {
      missionSheet.mission_items.sort((a: any, b: any) => a.order_index - b.order_index)
    }

    return NextResponse.json({ missionSheet })
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
    const body = await request.json()

    const { data: missionSheet, error } = await supabase
      .from('mission_sheets')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating mission sheet:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!missionSheet) {
      return NextResponse.json({ error: 'ミッションシートが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ missionSheet })
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

    // 関連するミッション項目も削除
    await supabase
      .from('mission_items')
      .delete()
      .eq('mission_sheet_id', params.id)

    // ミッションシートを削除
    const { error } = await supabase
      .from('mission_sheets')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting mission sheet:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'ミッションシートを削除しました' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}