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

    // ミッション項目の完了状態を更新
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    // 完了状態の場合は完了日時を設定
    if (body.completed === true) {
      updateData.completed_at = new Date().toISOString()
    } else if (body.completed === false) {
      updateData.completed_at = null
    }

    const { data: missionItem, error } = await supabase
      .from('mission_items')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating mission item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!missionItem) {
      return NextResponse.json({ error: 'ミッション項目が見つかりません' }, { status: 404 })
    }

    // ミッションシートの完了状態をチェック
    const { data: allItems } = await supabase
      .from('mission_items')
      .select('completed_at')
      .eq('mission_sheet_id', missionItem.mission_sheet_id)

    if (allItems) {
      const allCompleted = allItems.every(item => item.completed_at !== null)
      const someCompleted = allItems.some(item => item.completed_at !== null)

      let sheetStatus = 'draft'
      if (allCompleted) {
        sheetStatus = 'completed'
      } else if (someCompleted) {
        sheetStatus = 'in_progress'
      }

      // ミッションシートのステータスを更新
      await supabase
        .from('mission_sheets')
        .update({
          status: sheetStatus,
          ...(allCompleted && { completed_at: new Date().toISOString() }),
          updated_at: new Date().toISOString()
        })
        .eq('id', missionItem.mission_sheet_id)
    }

    return NextResponse.json({ missionItem })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}