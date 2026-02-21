import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdatePDFMaterialRequest } from '@/types/content'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    const { data: pdfMaterial, error } = await supabase
      .from('pdf_materials')
      .select(`
        *,
        created_by_name:coaches!pdf_materials_created_by_fkey(name),
        pdf_stats!left(
          view_count,
          download_count
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching PDF material:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!pdfMaterial) {
      return NextResponse.json({ error: 'PDF教材が見つかりません' }, { status: 404 })
    }

    // 閲覧数をカウントアップ
    await supabase
      .from('pdf_stats')
      .upsert({
        pdf_material_id: params.id,
        view_count: (pdfMaterial.pdf_stats?.[0]?.view_count || 0) + 1,
        download_count: pdfMaterial.pdf_stats?.[0]?.download_count || 0,
      })

    const materialWithDetails = {
      ...pdfMaterial,
      created_by_name: pdfMaterial.created_by_name?.[0]?.name,
      view_count: (pdfMaterial.pdf_stats?.[0]?.view_count || 0) + 1,
      download_count: pdfMaterial.pdf_stats?.[0]?.download_count || 0,
    }

    return NextResponse.json({ pdfMaterial: materialWithDetails })
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
    const body: UpdatePDFMaterialRequest = await request.json()

    const { data: pdfMaterial, error } = await supabase
      .from('pdf_materials')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating PDF material:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!pdfMaterial) {
      return NextResponse.json({ error: 'PDF教材が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ pdfMaterial })
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

    // 統計データも削除
    await supabase
      .from('pdf_stats')
      .delete()
      .eq('pdf_material_id', params.id)

    const { error } = await supabase
      .from('pdf_materials')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting PDF material:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'PDF教材を削除しました' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}