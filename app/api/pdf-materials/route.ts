import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreatePDFMaterialRequest } from '@/types/content'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const sport = searchParams.get('sport')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = supabase
      .from('pdf_materials')
      .select(`
        *,
        created_by_name:coaches!pdf_materials_created_by_fkey(name),
        pdf_stats!left(
          view_count,
          download_count
        )
      `)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (sport) {
      query = query.eq('sport', sport)
    }

    if (level) {
      query = query.eq('level', parseInt(level))
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || '10') - 1)
    }

    const { data: pdfMaterials, error, count } = await query

    if (error) {
      console.error('Error fetching PDF materials:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // データ整形
    const materialsWithDetails = pdfMaterials?.map(material => ({
      ...material,
      created_by_name: material.created_by_name?.[0]?.name,
      view_count: material.pdf_stats?.[0]?.view_count || 0,
      download_count: material.pdf_stats?.[0]?.download_count || 0,
    }))

    return NextResponse.json({
      pdfMaterials: materialsWithDetails,
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
    const body: CreatePDFMaterialRequest = await request.json()

    // バリデーション
    if (!body.title || !body.url || !body.category || !body.sport) {
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

    const { data: pdfMaterial, error } = await supabase
      .from('pdf_materials')
      .insert({
        title: body.title,
        description: body.description,
        url: body.url,
        thumbnail_url: body.thumbnail_url,
        file_size: body.file_size,
        category: body.category,
        tags: body.tags,
        level: body.level,
        sport: body.sport,
        is_downloadable: body.is_downloadable,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating PDF material:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 統計レコードを初期化
    await supabase
      .from('pdf_stats')
      .insert({
        pdf_material_id: pdfMaterial.id,
        view_count: 0,
        download_count: 0,
      })

    return NextResponse.json({ pdfMaterial }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}