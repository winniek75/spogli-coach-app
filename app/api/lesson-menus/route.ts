import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateLessonMenuRequest, LessonMenuWithDetails } from '@/types/lesson-menu'
export const dynamic = 'force-dynamic'

// 動画コンテンツデモデータ
const demoVideos = [
  {
    id: 'v1',
    title: 'バスケットボール基礎ドリブル',
    description: 'ドリブルの基本姿勢と練習方法',
    sport: 'basketball',
    level: 1,
    duration_minutes: 15,
    thumbnail_url: null,
    video_url: null,
    category: 'skill_training',
    tags: ['ドリブル', '基礎']
  },
  {
    id: 'v2',
    title: 'バスケットボールシューティング',
    description: 'フォームシューティングの基本',
    sport: 'basketball',
    level: 1,
    duration_minutes: 12,
    thumbnail_url: null,
    video_url: null,
    category: 'skill_training',
    tags: ['シュート', '基礎']
  },
  {
    id: 'v3',
    title: 'サッカーボールコントロール',
    description: 'ボールタッチとコントロール技術',
    sport: 'soccer',
    level: 2,
    duration_minutes: 18,
    thumbnail_url: null,
    video_url: null,
    category: 'skill_training',
    tags: ['ボールコントロール', 'テクニック']
  },
  {
    id: 'v4',
    title: 'バレーボールレシーブ基礎',
    description: 'アンダーハンドレシーブの基本',
    sport: 'volleyball',
    level: 1,
    duration_minutes: 14,
    thumbnail_url: null,
    video_url: null,
    category: 'skill_training',
    tags: ['レシーブ', '基礎']
  }
]

// 月次レッスンメニューデモデータ
const demoMonthlyMenus: LessonMenuWithDetails[] = [
  {
    id: 'monthly-1',
    title: '2024年2月 バスケットボール基礎コース',
    description: '1ヶ月でバスケットボールの基礎を習得する総合プログラム',
    sport: 'basketball',
    level: 1,
    duration_minutes: 240, // 4週間分
    objectives: ['ドリブル技術の習得', 'シュートフォームの確立', 'ゲーム理解の向上'],
    equipment: ['バスケットボール', 'コーン', 'ゴール'],
    tags: ['月次プログラム', '基礎', '総合'],
    is_public: true,
    is_template: true,
    created_by: 'coach-1',
    created_by_name: 'Risa',
    monthly_type: 'monthly',
    weeks: [
      {
        week: 1,
        title: '第1週: ドリブル基礎',
        description: 'ドリブルの基本姿勢と片手ドリブルをマスター',
        video_content: {
          id: 'v1',
          title: 'バスケットボール基礎ドリブル',
          duration_minutes: 15
        },
        activities: [
          {
            id: 'w1-1',
            name: 'ウォームアップ',
            description: 'ジョギングとストレッチ',
            duration_minutes: 10,
            order_index: 1,
            video_reference: null
          },
          {
            id: 'w1-2',
            name: '動画学習: ドリブル基礎',
            description: 'ドリブルの基本姿勢と練習方法を動画で学習',
            duration_minutes: 15,
            order_index: 2,
            video_reference: 'v1'
          },
          {
            id: 'w1-3',
            name: '実技練習: 片手ドリブル',
            description: '右手、左手それぞれでのドリブル練習',
            duration_minutes: 20,
            order_index: 3,
            video_reference: null
          },
          {
            id: 'w1-4',
            name: 'クールダウン',
            description: 'ストレッチとまとめ',
            duration_minutes: 15,
            order_index: 4,
            video_reference: null
          }
        ]
      },
      {
        week: 2,
        title: '第2週: シュート基礎',
        description: 'フォームシューティングの習得',
        video_content: {
          id: 'v2',
          title: 'バスケットボールシューティング',
          duration_minutes: 12
        },
        activities: [
          {
            id: 'w2-1',
            name: 'ウォームアップ',
            description: 'ドリブル復習とストレッチ',
            duration_minutes: 10,
            order_index: 1,
            video_reference: null
          },
          {
            id: 'w2-2',
            name: '動画学習: シュートフォーム',
            description: '正しいシュートフォームを動画で学習',
            duration_minutes: 12,
            order_index: 2,
            video_reference: 'v2'
          },
          {
            id: 'w2-3',
            name: '実技練習: フォームシューティング',
            description: '近距離でのシュート練習',
            duration_minutes: 25,
            order_index: 3,
            video_reference: null
          },
          {
            id: 'w2-4',
            name: 'クールダウン',
            description: 'ストレッチとまとめ',
            duration_minutes: 13,
            order_index: 4,
            video_reference: null
          }
        ]
      },
      {
        week: 3,
        title: '第3週: ドリブル＋シュート組み合わせ',
        description: 'ドリブルからシュートへの連続動作',
        video_content: null,
        activities: [
          {
            id: 'w3-1',
            name: 'ウォームアップ',
            description: '基本技術の復習',
            duration_minutes: 15,
            order_index: 1,
            video_reference: null
          },
          {
            id: 'w3-2',
            name: 'ドリブル＋シュート練習',
            description: 'ドリブルからレイアップシュート',
            duration_minutes: 30,
            order_index: 2,
            video_reference: null
          },
          {
            id: 'w3-3',
            name: 'ミニゲーム',
            description: '2対2の簡単なゲーム',
            duration_minutes: 20,
            order_index: 3,
            video_reference: null
          },
          {
            id: 'w3-4',
            name: 'クールダウン',
            description: 'ストレッチとまとめ',
            duration_minutes: 15,
            order_index: 4,
            video_reference: null
          }
        ]
      },
      {
        week: 4,
        title: '第4週: 総合練習とテスト',
        description: '1ヶ月の総仕上げと技術テスト',
        video_content: null,
        activities: [
          {
            id: 'w4-1',
            name: 'ウォームアップ',
            description: '総復習',
            duration_minutes: 15,
            order_index: 1,
            video_reference: null
          },
          {
            id: 'w4-2',
            name: '技術テスト',
            description: 'ドリブルとシュートの技術評価',
            duration_minutes: 20,
            order_index: 2,
            video_reference: null
          },
          {
            id: 'w4-3',
            name: '実戦ゲーム',
            description: '学んだ技術を活かしたゲーム',
            duration_minutes: 30,
            order_index: 3,
            video_reference: null
          },
          {
            id: 'w4-4',
            name: '振り返りとまとめ',
            description: '1ヶ月の成長を確認',
            duration_minutes: 15,
            order_index: 4,
            video_reference: null
          }
        ]
      }
    ],
    activities: [], // 月次メニューでは週単位で管理
    usage_count: 25,
    favorite_count: 15,
    last_used_date: '2024-02-28',
    created_at: '2024-02-01',
    updated_at: '2024-02-28'
  },
  {
    id: 'monthly-2',
    title: '2024年3月 サッカー技術向上コース',
    description: 'サッカーのテクニック向上を目指す1ヶ月プログラム',
    sport: 'soccer',
    level: 2,
    duration_minutes: 320, // 4週間分
    objectives: ['ボールコントロールの向上', 'パス精度の向上', '戦術理解の深化'],
    equipment: ['サッカーボール', 'コーン', 'ゴール', 'マーカー'],
    tags: ['月次プログラム', 'テクニック', '中級'],
    is_public: true,
    is_template: true,
    created_by: 'coach-2',
    created_by_name: 'Aung',
    monthly_type: 'monthly',
    weeks: [
      {
        week: 1,
        title: '第1週: ボールコントロール',
        description: 'ボールタッチの技術向上',
        video_content: {
          id: 'v3',
          title: 'サッカーボールコントロール',
          duration_minutes: 18
        },
        activities: [
          {
            id: 's1-1',
            name: 'ウォームアップ',
            description: 'ジョギングとボールタッチ',
            duration_minutes: 15,
            order_index: 1,
            video_reference: null
          },
          {
            id: 's1-2',
            name: '動画学習: ボールコントロール',
            description: 'ボールタッチとコントロール技術を動画で学習',
            duration_minutes: 18,
            order_index: 2,
            video_reference: 'v3'
          },
          {
            id: 's1-3',
            name: '実技練習: ボールタッチ',
            description: '様々な部位でのボールタッチ練習',
            duration_minutes: 35,
            order_index: 3,
            video_reference: null
          },
          {
            id: 's1-4',
            name: 'クールダウン',
            description: 'ストレッチとまとめ',
            duration_minutes: 12,
            order_index: 4,
            video_reference: null
          }
        ]
      }
      // 他の週も同様の構造で定義...
    ],
    activities: [],
    usage_count: 18,
    favorite_count: 10,
    last_used_date: '2024-03-28',
    created_at: '2024-03-01',
    updated_at: '2024-03-28'
  }
]

// 単発レッスンメニューデモデータ
const demoSingleMenus: LessonMenuWithDetails[] = [
  {
    id: 'single-1',
    title: 'バレーボール体験レッスン',
    description: 'バレーボール初心者向けの体験レッスン',
    sport: 'volleyball',
    level: 1,
    duration_minutes: 60,
    objectives: ['バレーボールの楽しさを知る', '基本ルールを覚える'],
    equipment: ['バレーボール', 'ネット'],
    tags: ['体験', '初心者', '単発'],
    is_public: true,
    is_template: false,
    created_by: 'coach-3',
    created_by_name: 'Gecko',
    monthly_type: 'single',
    activities: [
      {
        id: 'single1-1',
        lesson_menu_id: 'single-1',
        name: 'ゲーム感覚のウォームアップ',
        description: 'ボールを使った楽しいゲーム',
        duration_minutes: 15,
        order_index: 1,
        video_reference: null
      },
      {
        id: 'single1-2',
        lesson_menu_id: 'single-1',
        name: '動画学習: バレーボール基礎',
        description: 'バレーボールの基本を動画で学習',
        duration_minutes: 14,
        order_index: 2,
        video_reference: 'v4'
      },
      {
        id: 'single1-3',
        lesson_menu_id: 'single-1',
        name: '基本技術体験',
        description: 'パス、レシーブの基本体験',
        duration_minutes: 25,
        order_index: 3,
        video_reference: null
      },
      {
        id: 'single1-4',
        lesson_menu_id: 'single-1',
        name: 'ミニゲーム',
        description: '楽しいミニゲーム体験',
        duration_minutes: 6,
        order_index: 4,
        video_reference: null
      }
    ],
    usage_count: 12,
    favorite_count: 7,
    last_used_date: '2024-01-19',
    created_at: '2024-01-15',
    updated_at: '2024-01-19'
  }
]

// 全レッスンメニューを結合
const demoLessonMenus: LessonMenuWithDetails[] = [
  ...demoMonthlyMenus,
  ...demoSingleMenus
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