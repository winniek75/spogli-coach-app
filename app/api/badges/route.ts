import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
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