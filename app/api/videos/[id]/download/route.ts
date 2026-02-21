import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    // 動画情報を取得
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select(`
        *,
        video_stats!left(download_count)
      `)
      .eq('id', params.id)
      .single()

    if (videoError || !video) {
      console.error('Error fetching video:', videoError)
      return NextResponse.json({ error: '動画が見つかりません' }, { status: 404 })
    }

    if (!video.is_downloadable) {
      return NextResponse.json({ error: 'この動画はダウンロードできません' }, { status: 403 })
    }

    // ダウンロード数をカウントアップ
    await supabase
      .from('video_stats')
      .upsert({
        video_id: params.id,
        view_count: video.video_stats?.[0]?.view_count || 0,
        download_count: (video.video_stats?.[0]?.download_count || 0) + 1,
      })

    // ダウンロードログを記録
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('download_logs')
        .insert({
          content_type: 'video',
          content_id: params.id,
          user_id: user.id,
          downloaded_at: new Date().toISOString(),
        })
    }

    // 実際のファイルダウンロードURLを返す
    // 本来はファイルストレージから署名付きURLを取得
    return NextResponse.json({
      download_url: video.url,
      filename: `${video.title}.mp4`,
      content_type: 'video/mp4'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}