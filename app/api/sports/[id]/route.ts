import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateSportRequest } from '@/types/sport'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    const { data: sport, error } = await supabase
      .from('sports')
      .select(`
        *,
        category:sport_categories!sports_category_id_fkey(*),
        objectives:sport_objectives!sport_objectives_sport_id_fkey(*),
        skills:sport_skills!sport_skills_sport_id_fkey(*),
        levels:sport_levels!sport_levels_sport_id_fkey(*),
        equipment:sport_equipment!sport_equipment_sport_id_fkey(*),
        metrics:sport_metrics!sport_metrics_sport_id_fkey(*),
        rules:sport_rules!sport_rules_sport_id_fkey(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'スポーツが見つかりません' }, { status: 404 })
      }
      console.error('Error fetching sport:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sport })
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
    const body: UpdateSportRequest = await request.json()

    // 既存のスポーツを確認
    const { data: existing } = await supabase
      .from('sports')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'スポーツが見つかりません' },
        { status: 404 }
      )
    }

    // 更新
    const { data: sport, error } = await supabase
      .from('sports')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select(`
        *,
        category:sport_categories!sports_category_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Error updating sport:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sport })
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

    // 関連データの確認
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('sport', params.id)
      .limit(1)

    if (students && students.length > 0) {
      return NextResponse.json(
        { error: 'このスポーツは生徒に使用されているため削除できません' },
        { status: 409 }
      )
    }

    // 削除
    const { error } = await supabase
      .from('sports')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting sport:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}