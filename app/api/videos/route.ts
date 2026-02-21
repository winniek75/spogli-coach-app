import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// デモ動画データ
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
    created_by_name: { name: '山田太郎' },
    video_stats: { view_count: 45, download_count: 12 }
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
    created_by_name: { name: '佐藤花子' },
    video_stats: { view_count: 32, download_count: 8 }
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
    created_by_name: { name: '山田太郎' },
    video_stats: { view_count: 67, download_count: 18 }
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
    created_by_name: { name: '田中一郎' },
    video_stats: { view_count: 28, download_count: 5 }
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
    created_by_name: { name: '佐藤花子' },
    video_stats: { view_count: 53, download_count: 15 }
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
    created_by_name: { name: '山田太郎' },
    video_stats: { view_count: 41, download_count: 11 }
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
    created_by_name: { name: '田中一郎' },
    video_stats: { view_count: 89, download_count: 25 }
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
    created_by_name: { name: '佐藤花子' },
    video_stats: { view_count: 76, download_count: 20 }
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

    let filteredVideos = [...demoVideos]

    // フィルタリング
    if (category && category !== 'all') {
      filteredVideos = filteredVideos.filter(video => video.category === category)
    }

    if (sport && sport !== 'all') {
      filteredVideos = filteredVideos.filter(video => video.sport === sport || video.sport === 'general')
    }

    if (level && level !== 'all') {
      filteredVideos = filteredVideos.filter(video => video.level === parseInt(level))
    }

    if (search && search !== 'all') {
      const searchLower = search.toLowerCase()
      filteredVideos = filteredVideos.filter(video =>
        video.title.toLowerCase().includes(searchLower) ||
        video.description.toLowerCase().includes(searchLower)
      )
    }

    // ページネーション
    const limit = limitParam ? parseInt(limitParam) : 50
    const offset = offsetParam ? parseInt(offsetParam) : 0

    const paginatedVideos = filteredVideos.slice(offset, offset + limit)

    return NextResponse.json({
      videos: paginatedVideos,
      total: filteredVideos.length,
      has_more: offset + limit < filteredVideos.length
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

    // 新しい動画データを作成（実際の実装ではSupabaseに保存）
    const newVideo = {
      id: `video-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user',
      created_by_name: { name: '現在のユーザー' },
      video_stats: { view_count: 0, download_count: 0 }
    }

    return NextResponse.json({
      message: 'Video created successfully',
      video: newVideo
    })

  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}