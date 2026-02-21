import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateSportRequest } from '@/types/sport'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // デモモード: Supabaseが設定されていない場合はデモデータを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      // デモスポーツデータ
      const demoSports = [
        {
          id: 'sport-1',
          name: 'バスケットボール',
          description: '5人制のチームスポーツ',
          category_id: 'cat-1',
          is_active: true,
          age_range_min: 6,
          age_range_max: 18,
          difficulty_level: 3,
          equipment_required: ['バスケットボール', 'ゴール', 'コート'],
          objectives: [
            { id: 'obj-1', description: 'ドリブル技術の習得', skill_level: 1 },
            { id: 'obj-2', description: 'シュート技術の習得', skill_level: 2 },
            { id: 'obj-3', description: 'パス技術の習得', skill_level: 1 }
          ],
          skills: [
            { id: 'skill-1', name: 'ドリブル', category: 'basic', level: 1 },
            { id: 'skill-2', name: 'シューティング', category: 'basic', level: 2 },
            { id: 'skill-3', name: 'パス', category: 'basic', level: 1 }
          ],
          levels: [
            { id: 'level-1', level: 1, description: '基礎', requirements: ['ボールに慣れる'] },
            { id: 'level-2', level: 2, description: '初級', requirements: ['ドリブルができる'] },
            { id: 'level-3', level: 3, description: '中級', requirements: ['基本技術ができる'] }
          ],
          equipment: [
            { id: 'eq-1', name: 'バスケットボール', required: true, quantity: 1 },
            { id: 'eq-2', name: 'コーン', required: false, quantity: 4 }
          ],
          metrics: [
            { id: 'metric-1', name: 'シュート成功率', unit: '%', target_value: 60 },
            { id: 'metric-2', name: 'フリースロー成功率', unit: '%', target_value: 70 }
          ],
          created_at: '2024-01-01',
          updated_at: '2024-01-20'
        },
        {
          id: 'sport-2',
          name: 'サッカー',
          description: '11人制のチームスポーツ',
          category_id: 'cat-1',
          is_active: true,
          age_range_min: 6,
          age_range_max: 18,
          difficulty_level: 3,
          equipment_required: ['サッカーボール', 'ゴール', 'コート'],
          objectives: [
            { id: 'obj-4', description: 'ボールコントロールの習得', skill_level: 1 },
            { id: 'obj-5', description: 'パス技術の習得', skill_level: 2 },
            { id: 'obj-6', description: 'シュート技術の習得', skill_level: 2 }
          ],
          skills: [
            { id: 'skill-4', name: 'ボールコントロール', category: 'basic', level: 1 },
            { id: 'skill-5', name: 'パス', category: 'basic', level: 1 },
            { id: 'skill-6', name: 'シュート', category: 'basic', level: 2 }
          ],
          levels: [
            { id: 'level-4', level: 1, description: '基礎', requirements: ['ボールに慣れる'] },
            { id: 'level-5', level: 2, description: '初級', requirements: ['基本的なボールタッチができる'] },
            { id: 'level-6', level: 3, description: '中級', requirements: ['パス・ドリブルができる'] }
          ],
          equipment: [
            { id: 'eq-3', name: 'サッカーボール', required: true, quantity: 1 },
            { id: 'eq-4', name: 'コーン', required: false, quantity: 6 }
          ],
          metrics: [
            { id: 'metric-3', name: 'パス成功率', unit: '%', target_value: 80 },
            { id: 'metric-4', name: 'ドリブル成功率', unit: '%', target_value: 70 }
          ],
          created_at: '2024-01-01',
          updated_at: '2024-01-20'
        },
        {
          id: 'sport-3',
          name: 'バレーボール',
          description: '6人制のチームスポーツ',
          category_id: 'cat-1',
          is_active: true,
          age_range_min: 8,
          age_range_max: 18,
          difficulty_level: 3,
          equipment_required: ['バレーボール', 'ネット', 'コート'],
          objectives: [
            { id: 'obj-7', description: 'レシーブ技術の習得', skill_level: 1 },
            { id: 'obj-8', description: 'スパイク技術の習得', skill_level: 3 },
            { id: 'obj-9', description: 'サーブ技術の習得', skill_level: 2 }
          ],
          skills: [
            { id: 'skill-7', name: 'レシーブ', category: 'basic', level: 1 },
            { id: 'skill-8', name: 'スパイク', category: 'advanced', level: 3 },
            { id: 'skill-9', name: 'サーブ', category: 'basic', level: 2 }
          ],
          levels: [
            { id: 'level-7', level: 1, description: '基礎', requirements: ['ボールに慣れる'] },
            { id: 'level-8', level: 2, description: '初級', requirements: ['レシーブができる'] },
            { id: 'level-9', level: 3, description: '中級', requirements: ['基本技術ができる'] }
          ],
          equipment: [
            { id: 'eq-5', name: 'バレーボール', required: true, quantity: 1 },
            { id: 'eq-6', name: 'ネット', required: true, quantity: 1 }
          ],
          metrics: [
            { id: 'metric-5', name: 'レシーブ成功率', unit: '%', target_value: 75 },
            { id: 'metric-6', name: 'サーブ成功率', unit: '%', target_value: 80 }
          ],
          created_at: '2024-01-01',
          updated_at: '2024-01-20'
        }
      ]

      const { searchParams } = new URL(request.url)
      const category = searchParams.get('category')
      const is_active = searchParams.get('is_active')
      const search = searchParams.get('search')

      let filteredSports = [...demoSports]

      if (category) {
        filteredSports = filteredSports.filter(s => s.category_id === category)
      }

      if (is_active === 'true') {
        filteredSports = filteredSports.filter(s => s.is_active === true)
      } else if (is_active === 'false') {
        filteredSports = filteredSports.filter(s => s.is_active === false)
      }

      if (search) {
        const searchLower = search.toLowerCase()
        filteredSports = filteredSports.filter(s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
        )
      }

      return NextResponse.json({
        sports: filteredSports,
        count: filteredSports.length
      })
    }

    // 本番モード: Supabaseからデータを取得
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