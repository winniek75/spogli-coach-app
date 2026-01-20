import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateLessonMenuRequest, LessonMenuWithDetails } from '@/types/lesson-menu'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

// デモデータ（lesson-menus/route.tsと同じデータを使用）
const demoMonthlyMenus: LessonMenuWithDetails[] = [
  {
    id: 'monthly-1',
    title: '2024年2月 バスケットボール基礎コース',
    description: '1ヶ月でバスケットボールの基礎を習得する総合プログラム',
    sport: 'basketball',
    level: 1,
    duration_minutes: 240,
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
    activities: [],
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
    duration_minutes: 320,
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
    ],
    activities: [],
    usage_count: 18,
    favorite_count: 10,
    last_used_date: '2024-03-28',
    created_at: '2024-03-01',
    updated_at: '2024-03-28'
  }
]

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

const demoLessonMenus: LessonMenuWithDetails[] = [
  ...demoMonthlyMenus,
  ...demoSingleMenus
]

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // デモモード: Supabaseが設定されていない場合はデモデータを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const lessonMenu = demoLessonMenus.find(m => m.id === params.id)

      if (!lessonMenu) {
        return NextResponse.json({ error: 'レッスンメニューが見つかりません' }, { status: 404 })
      }

      return NextResponse.json({ lessonMenu })
    }

    // 本番モード: Supabaseからデータを取得
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
    // デモモード: 更新をシミュレート
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const body: UpdateLessonMenuRequest = await request.json()
      const lessonMenu = demoLessonMenus.find(m => m.id === params.id)

      if (!lessonMenu) {
        return NextResponse.json({ error: 'レッスンメニューが見つかりません' }, { status: 404 })
      }

      // デモモードでは実際には更新しないが、成功レスポンスを返す
      const updatedMenu = {
        ...lessonMenu,
        ...body,
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({ lessonMenu: updatedMenu })
    }

    // 本番モード: Supabaseでデータを更新
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
    // デモモード: 削除をシミュレート
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const lessonMenu = demoLessonMenus.find(m => m.id === params.id)

      if (!lessonMenu) {
        return NextResponse.json({ error: 'レッスンメニューが見つかりません' }, { status: 404 })
      }

      return NextResponse.json({ message: 'レッスンメニューを削除しました' })
    }

    // 本番モード: Supabaseでデータを削除
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