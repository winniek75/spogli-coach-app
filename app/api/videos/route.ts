import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// デモ動画データ（開発用フォールバック）
const demoVideos = [
  {
    id: 'video-1',
    title: 'バレーボール アンダーハンドパス基礎',
    description: '初心者向けアンダーハンドパスの基本動作を解説',
    sport: 'volleyball',
    category: 'technique',
    level: 1,
    duration: 180,
    file_size: 15728640,
    file_url: '/videos/demo/volleyball-underhand-pass.mp4',
    thumbnail_url: '/api/placeholder/320/180',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    created_by: 'coach-1',
    created_by_name: '山田太郎',
    view_count: 45,
    download_count: 12
  },
  {
    id: 'video-2',
    title: 'バレーボール サーブ練習',
    description: 'サーブの基本フォームと練習方法',
    sport: 'volleyball',
    category: 'technique',
    level: 2,
    duration: 240,
    file_size: 20971520,
    file_url: '/videos/demo/volleyball-serve.mp4',
    thumbnail_url: '/api/placeholder/320/180',
    created_at: '2025-01-14T14:30:00Z',
    updated_at: '2025-01-14T14:30:00Z',
    created_by: 'coach-2',
    created_by_name: '佐藤花子',
    view_count: 32,
    download_count: 8
  },
  {
    id: 'video-3',
    title: 'バスケットボール ドリブル基礎',
    description: '基本的なドリブルテクニック',
    sport: 'basketball',
    category: 'technique',
    level: 1,
    duration: 300,
    file_size: 25165824,
    file_url: '/videos/demo/basketball-dribble.mp4',
    thumbnail_url: '/api/placeholder/320/180',
    created_at: '2025-01-13T09:15:00Z',
    updated_at: '2025-01-13T09:15:00Z',
    created_by: 'coach-1',
    created_by_name: '山田太郎',
    view_count: 67,
    download_count: 18
  },
  {
    id: 'video-4',
    title: 'バスケットボール レイアップシュート',
    description: 'レイアップシュートの基本動作',
    sport: 'basketball',
    category: 'technique',
    level: 2,
    duration: 210,
    file_size: 18874368,
    file_url: '/videos/demo/basketball-layup.mp4',
    thumbnail_url: '/api/placeholder/320/180',
    created_at: '2025-01-12T16:45:00Z',
    updated_at: '2025-01-12T16:45:00Z',
    created_by: 'coach-3',
    created_by_name: '田中一郎',
    view_count: 28,
    download_count: 5
  },
  {
    id: 'video-5',
    title: 'サッカー インサイドキック',
    description: '正確なインサイドキックの練習方法',
    sport: 'soccer',
    category: 'technique',
    level: 1,
    duration: 180,
    file_size: 16777216,
    file_url: '/videos/demo/soccer-inside-kick.mp4',
    thumbnail_url: '/api/placeholder/320/180',
    created_at: '2025-01-11T11:20:00Z',
    updated_at: '2025-01-11T11:20:00Z',
    created_by: 'coach-2',
    created_by_name: '佐藤花子',
    view_count: 53,
    download_count: 15
  },
  {
    id: 'video-6',
    title: 'サッカー ドリブル練習',
    description: 'ボールコントロールとドリブルの基礎',
    sport: 'soccer',
    category: 'technique',
    level: 2,
    duration: 360,
    file_size: 31457280,
    file_url: '/videos/demo/soccer-dribble.mp4',
    thumbnail_url: '/api/placeholder/320/180',
    created_at: '2025-01-10T13:00:00Z',
    updated_at: '2025-01-10T13:00:00Z',
    created_by: 'coach-1',
    created_by_name: '山田太郎',
    view_count: 41,
    download_count: 11
  },
  {
    id: 'video-7',
    title: '体力づくり - ウォームアップ',
    description: '効果的なウォームアップ方法',
    sport: 'general',
    category: 'training',
    level: 1,
    duration: 300,
    file_size: 22020096,
    file_url: '/videos/demo/warmup-exercises.mp4',
    thumbnail_url: '/api/placeholder/320/180',
    created_at: '2025-01-09T08:30:00Z',
    updated_at: '2025-01-09T08:30:00Z',
    created_by: 'coach-3',
    created_by_name: '田中一郎',
    view_count: 89,
    download_count: 25
  },
  {
    id: 'video-8',
    title: 'ストレッチング',
    description: 'クールダウンのためのストレッチ',
    sport: 'general',
    category: 'training',
    level: 1,
    duration: 420,
    file_size: 35651584,
    file_url: '/videos/demo/stretching.mp4',
    thumbnail_url: '/api/placeholder/320/180',
    created_at: '2025-01-08T15:45:00Z',
    updated_at: '2025-01-08T15:45:00Z',
    created_by: 'coach-2',
    created_by_name: '佐藤花子',
    view_count: 76,
    download_count: 20
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const sport = searchParams.get('sport')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    // Supabaseからデータを取得
    let query = supabase.from('videos').select('*')

    // フィルタリング
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (sport && sport !== 'all') {
      query = query.eq('sport', sport)
    }

    if (level && level !== 'all') {
      query = query.eq('level', parseInt(level))
    }

    if (search && search !== '') {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // ページネーション
    const limit = limitParam ? parseInt(limitParam) : 50
    const offset = offsetParam ? parseInt(offsetParam) : 0

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

    const { data: videos, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message)
    }

    return NextResponse.json({
      videos: videos || [],
      total: videos?.length || 0,
      has_more: false
    })

  } catch (error) {
    console.error('Error in videos API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Supabaseに動画データを保存
    const videoData = {
      title: body.title,
      description: body.description || null,
      url: body.url || body.file_url,
      thumbnail_url: body.thumbnail_url || null,
      sport: body.sport,
      category: body.category,
      level: body.level,
      duration_minutes: body.duration_minutes || null,
      file_size: body.file_size || null,
      tags: body.tags || null,
      is_downloadable: body.is_downloadable !== false,
      view_count: 0,
      download_count: 0,
      created_by: body.created_by || null
    }

    const { data: video, error } = await supabase
      .from('videos')
      .insert(videoData)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw new Error(error.message)
    }

    return NextResponse.json({
      message: 'Video created successfully',
      video: video
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}