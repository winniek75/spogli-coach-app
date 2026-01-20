import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    // PDF教材情報を取得
    const { data: pdfMaterial, error: materialError } = await supabase
      .from('pdf_materials')
      .select(`
        *,
        pdf_stats!left(download_count)
      `)
      .eq('id', params.id)
      .single()

    if (materialError || !pdfMaterial) {
      console.error('Error fetching PDF material:', materialError)
      return NextResponse.json({ error: 'PDF教材が見つかりません' }, { status: 404 })
    }

    if (!pdfMaterial.is_downloadable) {
      return NextResponse.json({ error: 'このPDF教材はダウンロードできません' }, { status: 403 })
    }

    // ダウンロード数をカウントアップ
    await supabase
      .from('pdf_stats')
      .upsert({
        pdf_material_id: params.id,
        view_count: pdfMaterial.pdf_stats?.[0]?.view_count || 0,
        download_count: (pdfMaterial.pdf_stats?.[0]?.download_count || 0) + 1,
      })

    // ダウンロードログを記録
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('download_logs')
        .insert({
          content_type: 'pdf',
          content_id: params.id,
          user_id: user.id,
          downloaded_at: new Date().toISOString(),
        })
    }

    // 実際のファイルダウンロードURLを返す
    return NextResponse.json({
      download_url: pdfMaterial.url,
      filename: `${pdfMaterial.title}.pdf`,
      content_type: 'application/pdf'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}