import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UpdateVideoRequest } from '@/types/content'

export const dynamic = 'force-dynamic'

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // まずSupabaseから取得を試行
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!error && video) {
      // 視聴数を増やす
      await supabase
        .from('videos')
        .update({ view_count: (video.view_count || 0) + 1 })
        .eq('id', params.id)

      return NextResponse.json({
        video: {
          ...video,
          view_count: (video.view_count || 0) + 1
        }
      })
    }

    // Supabaseで見つからない場合は404
    return NextResponse.json(
      { error: 'Video not found' },
      { status: 404 }
    )
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