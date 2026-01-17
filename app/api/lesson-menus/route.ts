import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateLessonMenuRequest } from '@/types/lesson-menu'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const sport = searchParams.get('sport')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const isPublic = searchParams.get('is_public')
    const isTemplate = searchParams.get('is_template')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = supabase
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
      .order('created_at', { ascending: false })

    if (sport) {
      query = query.eq('sport', sport)
    }

    if (level) {
      query = query.eq('level', parseInt(level))
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`)
    }

    if (isPublic === 'true') {
      query = query.eq('is_public', true)
    }

    if (isTemplate === 'true') {
      query = query.eq('is_template', true)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || '10') - 1)
    }

    const { data: lessonMenus, error, count } = await query

    if (error) {
      console.error('Error fetching lesson menus:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // データ整形
    const menusWithDetails = lessonMenus?.map(menu => ({
      ...menu,
      created_by_name: menu.created_by_name?.[0]?.name,
      activities: menu.activities?.sort((a: any, b: any) => a.order_index - b.order_index),
      usage_count: menu.usage_stats?.[0]?.usage_count || 0,
      favorite_count: menu.usage_stats?.[0]?.favorite_count || 0,
      last_used_date: menu.usage_stats?.[0]?.last_used_date,
    }))

    return NextResponse.json({
      lessonMenus: menusWithDetails,
      total: count,
    })
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
    const body: CreateLessonMenuRequest = await request.json()

    // バリデーション
    if (!body.title || !body.sport || !body.activities || body.activities.length === 0) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // 現在のユーザーIDを取得
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // レッスンメニューを作成
    const { data: lessonMenu, error: menuError } = await supabase
      .from('lesson_menus')
      .insert({
        title: body.title,
        description: body.description,
        sport: body.sport,
        level: body.level,
        duration_minutes: body.duration_minutes,
        max_participants: body.max_participants,
        equipment_needed: body.equipment_needed,
        objectives: body.objectives,
        notes: body.notes,
        is_public: body.is_public,
        is_template: body.is_template,
        created_by: user.id,
      })
      .select()
      .single()

    if (menuError) {
      console.error('Error creating lesson menu:', menuError)
      return NextResponse.json({ error: menuError.message }, { status: 500 })
    }

    // アクティビティを作成
    const activities = body.activities.map(activity => ({
      lesson_menu_id: lessonMenu.id,
      title: activity.title,
      description: activity.description,
      duration_minutes: activity.duration_minutes,
      activity_type: activity.activity_type,
      instructions: activity.instructions,
      equipment: activity.equipment,
      safety_notes: activity.safety_notes,
      variations: activity.variations,
      order_index: activity.order_index,
    }))

    const { error: activitiesError } = await supabase
      .from('lesson_activities')
      .insert(activities)

    if (activitiesError) {
      console.error('Error creating lesson activities:', activitiesError)
      // レッスンメニューを削除してロールバック
      await supabase.from('lesson_menus').delete().eq('id', lessonMenu.id)
      return NextResponse.json({ error: activitiesError.message }, { status: 500 })
    }

    // 統計レコードを初期化
    await supabase
      .from('lesson_menu_usage_stats')
      .insert({
        lesson_menu_id: lessonMenu.id,
        usage_count: 0,
        favorite_count: 0,
      })

    return NextResponse.json({ lessonMenu }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}