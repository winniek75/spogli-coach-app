import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateVideoRequest } from '@/types/content'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

    const { data: video, error } = await supabase
      .from('videos')
      .select(`
        *,
        created_by_name:coaches!videos_created_by_fkey(name),
        video_stats!left(
          view_count,
          download_count
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching video:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!video) {
      return NextResponse.json({ error: '動画が見つかりません' }, { status: 404 })
    }

    // 視聴数をカウントアップ
    await supabase
      .from('video_stats')
      .upsert({
        video_id: params.id,
        view_count: (video.video_stats?.[0]?.view_count || 0) + 1,
        download_count: video.video_stats?.[0]?.download_count || 0,
      })

    const videoWithDetails = {
      ...video,
      created_by_name: video.created_by_name?.[0]?.name,
      view_count: (video.video_stats?.[0]?.view_count || 0) + 1,
      download_count: video.video_stats?.[0]?.download_count || 0,
    }

    return NextResponse.json({ video: videoWithDetails })
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
    const body: UpdateVideoRequest = await request.json()

    const { data: video, error } = await supabase
      .from('videos')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating video:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!video) {
      return NextResponse.json({ error: '動画が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ video })
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
      .from('video_stats')
      .delete()
      .eq('video_id', params.id)

    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting video:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: '動画を削除しました' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}