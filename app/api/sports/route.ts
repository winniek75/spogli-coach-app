import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateSportRequest } from '@/types/sport'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const is_active = searchParams.get('is_active')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = supabase
      .from('sports')
      .select(`
        *,
        category:sport_categories!sports_category_id_fkey(*),
        objectives:sport_objectives!sport_objectives_sport_id_fkey(*),
        skills:sport_skills!sport_skills_sport_id_fkey(*),
        levels:sport_levels!sport_levels_sport_id_fkey(*),
        equipment:sport_equipment!sport_equipment_sport_id_fkey(*),
        metrics:sport_metrics!sport_metrics_sport_id_fkey(*)
      `, { count: 'exact' })
      .order('name', { ascending: true })

    if (category) {
      query = query.eq('category_id', category)
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true')
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || '10') - 1)
    }

    const { data: sports, error, count } = await query

    if (error) {
      console.error('Error fetching sports:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      sports: sports || [],
      total: count || 0,
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
    const body: CreateSportRequest = await request.json()

    // バリデーション
    if (!body.code || !body.name || !body.category_id) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // 重複チェック
    const { data: existing } = await supabase
      .from('sports')
      .select('id')
      .eq('code', body.code)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'このスポーツコードは既に使用されています' },
        { status: 409 }
      )
    }

    // スポーツを作成
    const { data: sport, error } = await supabase
      .from('sports')
      .insert({
        code: body.code,
        name: body.name,
        description: body.description,
        category_id: body.category_id,
        image_url: body.image_url,
        icon: body.icon,
        color: body.color,
        is_active: body.is_active ?? true,
      })
      .select(`
        *,
        category:sport_categories!sports_category_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Error creating sport:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sport }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}