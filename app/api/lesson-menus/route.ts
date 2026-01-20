import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateLessonMenuRequest, LessonMenuWithDetails } from '@/types/lesson-menu'
export const dynamic = 'force-dynamic'

// デモデータ
const demoLessonMenus: LessonMenuWithDetails[] = [
  {
    id: '1',
    title: 'バスケットボール基礎練習',
    description: '初心者向けのドリブルとシュート練習',
    sport: 'basketball',
    level: 1,
    duration_minutes: 60,
    objectives: ['ドリブルの基本を身につける', 'レイアップシュートの練習'],
    equipment: ['バスケットボール', 'コーン'],
    tags: ['基礎', 'ドリブル', 'シュート'],
    is_public: true,
    is_template: true,
    created_by: 'coach-1',
    created_by_name: 'Risa',
    activities: [
      {
        id: '1',
        lesson_menu_id: '1',
        name: 'ウォームアップ',
        description: 'ジョギングとストレッチ',
        duration_minutes: 10,
        order_index: 1,
      },
      {
        id: '2',
        lesson_menu_id: '1',
        name: 'ドリブル練習',
        description: '片手ドリブル、交互ドリブル',
        duration_minutes: 20,
        order_index: 2,
      },
      {
        id: '3',
        lesson_menu_id: '1',
        name: 'シュート練習',
        description: 'レイアップシュート、フリースロー',
        duration_minutes: 25,
        order_index: 3,
      },
      {
        id: '4',
        lesson_menu_id: '1',
        name: 'クールダウン',
        description: 'ストレッチとまとめ',
        duration_minutes: 5,
        order_index: 4,
      }
    ],
    usage_count: 15,
    favorite_count: 8,
    last_used_date: '2024-01-18',
    created_at: '2024-01-01',
    updated_at: '2024-01-18'
  },
  {
    id: '2',
    title: 'サッカー基礎トレーニング',
    description: 'パスとドリブルの基本練習',
    sport: 'soccer',
    level: 2,
    duration_minutes: 90,
    objectives: ['正確なパスができるようになる', 'ドリブルで相手をかわす'],
    equipment: ['サッカーボール', 'マーカーコーン', 'ゴール'],
    tags: ['基礎', 'パス', 'ドリブル'],
    is_public: true,
    is_template: true,
    created_by: 'coach-2',
    created_by_name: 'Aung',
    activities: [
      {
        id: '5',
        lesson_menu_id: '2',
        name: 'ウォームアップ',
        description: 'ジョギングとボールタッチ',
        duration_minutes: 15,
        order_index: 1,
      },
      {
        id: '6',
        lesson_menu_id: '2',
        name: 'パス練習',
        description: '対面パス、三角パス',
        duration_minutes: 30,
        order_index: 2,
      },
      {
        id: '7',
        lesson_menu_id: '2',
        name: 'ドリブル練習',
        description: 'コーンドリブル、1対1',
        duration_minutes: 30,
        order_index: 3,
      },
      {
        id: '8',
        lesson_menu_id: '2',
        name: 'ミニゲーム',
        description: '4対4のミニゲーム',
        duration_minutes: 15,
        order_index: 4,
      }
    ],
    usage_count: 12,
    favorite_count: 6,
    last_used_date: '2024-01-19',
    created_at: '2024-01-05',
    updated_at: '2024-01-19'
  },
  {
    id: '3',
    title: 'バレーボール入門',
    description: 'レシーブとトスの基本',
    sport: 'volleyball',
    level: 1,
    duration_minutes: 60,
    objectives: ['アンダーハンドパスを習得', 'オーバーハンドパスを習得'],
    equipment: ['バレーボール', 'ネット'],
    tags: ['入門', 'レシーブ', 'トス'],
    is_public: true,
    is_template: false,
    created_by: 'coach-3',
    created_by_name: 'Gecko',
    activities: [
      {
        id: '9',
        lesson_menu_id: '3',
        name: 'ボール慣れ',
        description: 'ボールを使った準備運動',
        duration_minutes: 10,
        order_index: 1,
      },
      {
        id: '10',
        lesson_menu_id: '3',
        name: 'アンダーハンドパス',
        description: '対人パス練習',
        duration_minutes: 25,
        order_index: 2,
      },
      {
        id: '11',
        lesson_menu_id: '3',
        name: 'オーバーハンドパス',
        description: 'トス練習',
        duration_minutes: 20,
        order_index: 3,
      },
      {
        id: '12',
        lesson_menu_id: '3',
        name: 'まとめ',
        description: '復習とクールダウン',
        duration_minutes: 5,
        order_index: 4,
      }
    ],
    usage_count: 8,
    favorite_count: 4,
    last_used_date: '2024-01-17',
    created_at: '2024-01-10',
    updated_at: '2024-01-17'
  }
]

export async function GET(request: NextRequest) {
  try {
    // デモモード: Supabaseが設定されていない場合はデモデータを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const { searchParams } = new URL(request.url)
      const sport = searchParams.get('sport')
      const level = searchParams.get('level')
      const search = searchParams.get('search')

      let filteredMenus = [...demoLessonMenus]

      if (sport) {
        filteredMenus = filteredMenus.filter(m => m.sport === sport)
      }

      if (level) {
        filteredMenus = filteredMenus.filter(m => m.level === parseInt(level))
      }

      if (search) {
        const searchLower = search.toLowerCase()
        filteredMenus = filteredMenus.filter(m =>
          m.title.toLowerCase().includes(searchLower) ||
          m.description?.toLowerCase().includes(searchLower)
        )
      }

      return NextResponse.json({
        lessonMenus: filteredMenus,
        total: filteredMenus.length
      })
    }

    // 本番モード: Supabaseからデータを取得
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