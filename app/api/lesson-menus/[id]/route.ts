import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateLessonMenuRequest } from '@/types/lesson-menu'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    const { data: lessonMenu, error } = await supabase
      .from('lesson_menus')
      .select(`
        *,
        created_by_name:coaches!lesson_menus_created_by_fkey(name),
        activities:lesson_activities!lesson_activities_lesson_menu_id_fkey(*),
        usage_stats:lesson_menu_usage_stats!left(
          usage_count,
          favorite_count,
          last_used_date
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching lesson menu:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!lessonMenu) {
      return NextResponse.json({ error: 'レッスンメニューが見つかりません' }, { status: 404 })
    }

    // 利用回数をカウントアップ
    await supabase
      .from('lesson_menu_usage_stats')
      .upsert({
        lesson_menu_id: params.id,
        usage_count: (lessonMenu.usage_stats?.[0]?.usage_count || 0) + 1,
        favorite_count: lessonMenu.usage_stats?.[0]?.favorite_count || 0,
        last_used_date: new Date().toISOString().split('T')[0],
      })

    const menuWithDetails = {
      ...lessonMenu,
      created_by_name: lessonMenu.created_by_name?.[0]?.name,
      activities: lessonMenu.activities?.sort((a: any, b: any) => a.order_index - b.order_index),
      usage_count: (lessonMenu.usage_stats?.[0]?.usage_count || 0) + 1,
      favorite_count: lessonMenu.usage_stats?.[0]?.favorite_count || 0,
      last_used_date: new Date().toISOString().split('T')[0],
    }

    return NextResponse.json({ lessonMenu: menuWithDetails })
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
    const body: UpdateLessonMenuRequest = await request.json()

    const { data: lessonMenu, error } = await supabase
      .from('lesson_menus')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lesson menu:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!lessonMenu) {
      return NextResponse.json({ error: 'レッスンメニューが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ lessonMenu })
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

    // 関連するアクティビティと統計データも削除
    await Promise.all([
      supabase.from('lesson_activities').delete().eq('lesson_menu_id', params.id),
      supabase.from('lesson_menu_usage_stats').delete().eq('lesson_menu_id', params.id),
    ])

    // レッスンメニューを削除
    const { error } = await supabase
      .from('lesson_menus')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting lesson menu:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'レッスンメニューを削除しました' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}