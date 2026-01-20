import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    // デモモード: Supabaseが設定されていない場合はデモデータを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      // デモバッジデータ
      const demoBadges = [
        {
          id: 'badge-1',
          student_id: '1',
          sport: 'basketball',
          category: 'technical',
          badge_type: 'star',
          skill_name: 'ドリブル',
          skill_level: 1,
          earned_date: '2024-01-15',
          awarded_date: '2024-01-16',
          coach_id: '1',
          notes: '基本的なドリブルがしっかりできています',
          created_at: '2024-01-15',
          updated_at: '2024-01-16',
          student: {
            id: '1',
            name: '田中太郎',
            level: 3,
            school: 'ageo',
            class_type: 'elementary'
          }
        },
        {
          id: 'badge-2',
          student_id: '2',
          sport: 'basketball',
          category: 'technical',
          badge_type: 'shield',
          skill_name: 'シュート',
          skill_level: 2,
          earned_date: '2024-01-18',
          awarded_date: null,
          coach_id: '1',
          notes: 'フォームシューティングが向上しました',
          created_at: '2024-01-18',
          updated_at: '2024-01-18',
          student: {
            id: '2',
            name: '佐藤花子',
            level: 2,
            school: 'ageo',
            class_type: 'elementary'
          }
        },
        {
          id: 'badge-3',
          student_id: '3',
          sport: 'soccer',
          category: 'technical',
          badge_type: 'star',
          skill_name: 'パス',
          skill_level: 1,
          earned_date: '2024-01-20',
          awarded_date: '2024-01-21',
          coach_id: '2',
          notes: '正確なパスができるようになりました',
          created_at: '2024-01-20',
          updated_at: '2024-01-21',
          student: {
            id: '3',
            name: '鈴木一郎',
            level: 2,
            school: 'okegawa',
            class_type: 'elementary'
          }
        },
        {
          id: 'badge-4',
          student_id: '4',
          sport: 'volleyball',
          category: 'technical',
          badge_type: 'crown',
          skill_name: 'レシーブ',
          skill_level: 3,
          earned_date: '2024-01-22',
          awarded_date: null,
          coach_id: '3',
          notes: '高度なレシーブ技術を習得',
          created_at: '2024-01-22',
          updated_at: '2024-01-22',
          student: {
            id: '4',
            name: '高橋美咲',
            level: 4,
            school: 'okegawa',
            class_type: 'elementary'
          }
        }
      ]

      const { searchParams } = new URL(request.url)
      const studentId = searchParams.get('student_id')
      const sport = searchParams.get('sport')
      const badgeType = searchParams.get('badge_type')
      const awardedStatus = searchParams.get('awarded')

      let filteredBadges = [...demoBadges]

      if (studentId) {
        filteredBadges = filteredBadges.filter(b => b.student_id === studentId)
      }

      if (sport) {
        filteredBadges = filteredBadges.filter(b => b.sport === sport)
      }

      if (badgeType) {
        filteredBadges = filteredBadges.filter(b => b.badge_type === badgeType)
      }

      if (awardedStatus !== null) {
        if (awardedStatus === 'true') {
          filteredBadges = filteredBadges.filter(b => b.awarded_date !== null)
        } else if (awardedStatus === 'false') {
          filteredBadges = filteredBadges.filter(b => b.awarded_date === null)
        }
      }

      return NextResponse.json({
        badges: filteredBadges,
        count: filteredBadges.length
      })
    }

    // 本番モード: Supabaseからデータを取得
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const studentId = searchParams.get('student_id')
    const sport = searchParams.get('sport')
    const badgeType = searchParams.get('badge_type')
    const awardedStatus = searchParams.get('awarded')

    let query = supabase
      .from('badges')
      .select(`
        *,
        student:students!badges_student_id_fkey (
          id,
          name,
          level,
          school,
          class_type
        )
      `)
      .order('earned_date', { ascending: false })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (sport) {
      query = query.eq('sport', sport)
    }

    if (badgeType) {
      query = query.eq('badge_type', badgeType)
    }

    if (awardedStatus !== null) {
      if (awardedStatus === 'true') {
        query = query.not('awarded_date', 'is', null)
      } else if (awardedStatus === 'false') {
        query = query.is('awarded_date', null)
      }
    }

    const { data: badges, error } = await query

    if (error) {
      console.error('Error fetching badges:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ badges })
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
    const body = await request.json()

    // バリデーション
    if (!body.student_id || !body.sport || !body.category || !body.badge_type) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // 既存のバッジをチェック
    const { data: existingBadge } = await supabase
      .from('badges')
      .select('*')
      .eq('student_id', body.student_id)
      .eq('sport', body.sport)
      .eq('category', body.category)
      .single()

    if (existingBadge) {
      return NextResponse.json(
        { error: 'このカテゴリのバッジは既に獲得済みです' },
        { status: 400 }
      )
    }

    const { data: badge, error } = await supabase
      .from('badges')
      .insert({
        student_id: body.student_id,
        sport: body.sport,
        category: body.category,
        badge_type: body.badge_type,
        earned_date: body.earned_date || new Date().toISOString().split('T')[0],
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating badge:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ badge }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}