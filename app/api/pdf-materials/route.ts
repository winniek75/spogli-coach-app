import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// デモ教材データ
const demoMaterials = [
  {
    id: 'material-1',
    title: 'バレーボール基礎ルールブック',
    description: 'バレーボールの基本的なルールと審判方法について',
    sport: 'volleyball',
    category: 'rules',
    level: 1,
    page_count: 24,
    file_size: 5242880,
    file_url: '/materials/demo/volleyball-rules.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    created_by: 'coach-1',
    created_by_name: { name: '山田太郎' },
    pdf_stats: { view_count: 123, download_count: 45 }
  },
  {
    id: 'material-2',
    title: 'バレーボール練習メニュー集',
    description: '初心者から上級者まで使える練習メニュー30選',
    sport: 'volleyball',
    category: 'training',
    level: 2,
    page_count: 48,
    file_size: 8388608,
    file_url: '/materials/demo/volleyball-training.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-14T14:30:00Z',
    updated_at: '2025-01-14T14:30:00Z',
    created_by: 'coach-2',
    created_by_name: { name: '佐藤花子' },
    pdf_stats: { view_count: 89, download_count: 32 }
  },
  {
    id: 'material-3',
    title: 'バスケットボール戦術ガイド',
    description: 'オフェンス・ディフェンス戦術の基本',
    sport: 'basketball',
    category: 'strategy',
    level: 3,
    page_count: 36,
    file_size: 7340032,
    file_url: '/materials/demo/basketball-strategy.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-13T09:15:00Z',
    updated_at: '2025-01-13T09:15:00Z',
    created_by: 'coach-1',
    created_by_name: { name: '山田太郎' },
    pdf_stats: { view_count: 67, download_count: 28 }
  },
  {
    id: 'material-4',
    title: 'バスケットボール基礎技術',
    description: 'シュート・ドリブル・パスの基本技術',
    sport: 'basketball',
    category: 'technique',
    level: 1,
    page_count: 32,
    file_size: 6291456,
    file_url: '/materials/demo/basketball-basics.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-12T16:45:00Z',
    updated_at: '2025-01-12T16:45:00Z',
    created_by: 'coach-3',
    created_by_name: { name: '田中一郎' },
    pdf_stats: { view_count: 156, download_count: 58 }
  },
  {
    id: 'material-5',
    title: 'サッカー基本ルール',
    description: 'サッカーのルールと審判の基礎知識',
    sport: 'soccer',
    category: 'rules',
    level: 1,
    page_count: 20,
    file_size: 4194304,
    file_url: '/materials/demo/soccer-rules.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-11T11:20:00Z',
    updated_at: '2025-01-11T11:20:00Z',
    created_by: 'coach-2',
    created_by_name: { name: '佐藤花子' },
    pdf_stats: { view_count: 201, download_count: 72 }
  },
  {
    id: 'material-6',
    title: 'サッカー個人技術向上プログラム',
    description: 'ドリブル・キック・ヘディングの練習法',
    sport: 'soccer',
    category: 'technique',
    level: 2,
    page_count: 40,
    file_size: 9437184,
    file_url: '/materials/demo/soccer-skills.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-10T13:00:00Z',
    updated_at: '2025-01-10T13:00:00Z',
    created_by: 'coach-1',
    created_by_name: { name: '山田太郎' },
    pdf_stats: { view_count: 134, download_count: 51 }
  },
  {
    id: 'material-7',
    title: 'スポーツ栄養学基礎',
    description: 'アスリートのための栄養管理とコンディショニング',
    sport: 'general',
    category: 'health',
    level: 2,
    page_count: 56,
    file_size: 11534336,
    file_url: '/materials/demo/sports-nutrition.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-09T08:30:00Z',
    updated_at: '2025-01-09T08:30:00Z',
    created_by: 'coach-3',
    created_by_name: { name: '田中一郎' },
    pdf_stats: { view_count: 78, download_count: 35 }
  },
  {
    id: 'material-8',
    title: 'ケガ予防とコンディショニング',
    description: 'スポーツ傷害の予防と応急処置の基礎',
    sport: 'general',
    category: 'health',
    level: 1,
    page_count: 28,
    file_size: 5767168,
    file_url: '/materials/demo/injury-prevention.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-08T15:45:00Z',
    updated_at: '2025-01-08T15:45:00Z',
    created_by: 'coach-2',
    created_by_name: { name: '佐藤花子' },
    pdf_stats: { view_count: 245, download_count: 89 }
  },
  {
    id: 'material-9',
    title: 'チームビルディング手法',
    description: 'チームワーク向上のための実践的手法',
    sport: 'general',
    category: 'psychology',
    level: 2,
    page_count: 44,
    file_size: 8912896,
    file_url: '/materials/demo/team-building.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-07T12:15:00Z',
    updated_at: '2025-01-07T12:15:00Z',
    created_by: 'coach-1',
    created_by_name: { name: '山田太郎' },
    pdf_stats: { view_count: 167, download_count: 63 }
  },
  {
    id: 'material-10',
    title: 'スポーツ心理学入門',
    description: 'メンタルトレーニングとモチベーション管理',
    sport: 'general',
    category: 'psychology',
    level: 2,
    page_count: 52,
    file_size: 10485760,
    file_url: '/materials/demo/sports-psychology.pdf',
    thumbnail_url: '/api/placeholder/200/280',
    created_at: '2025-01-06T09:30:00Z',
    updated_at: '2025-01-06T09:30:00Z',
    created_by: 'coach-3',
    created_by_name: { name: '田中一郎' },
    pdf_stats: { view_count: 98, download_count: 41 }
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

    let filteredMaterials = [...demoMaterials]

    // フィルタリング
    if (category && category !== 'all') {
      filteredMaterials = filteredMaterials.filter(material => material.category === category)
    }

    if (sport && sport !== 'all') {
      filteredMaterials = filteredMaterials.filter(material => material.sport === sport || material.sport === 'general')
    }

    if (level && level !== 'all') {
      filteredMaterials = filteredMaterials.filter(material => material.level === parseInt(level))
    }

    if (search && search !== 'all') {
      const searchLower = search.toLowerCase()
      filteredMaterials = filteredMaterials.filter(material =>
        material.title.toLowerCase().includes(searchLower) ||
        material.description.toLowerCase().includes(searchLower)
      )
    }

    // ページネーション
    const limit = limitParam ? parseInt(limitParam) : 50
    const offset = offsetParam ? parseInt(offsetParam) : 0

    const paginatedMaterials = filteredMaterials.slice(offset, offset + limit)

    return NextResponse.json({
      materials: paginatedMaterials,
      total: filteredMaterials.length,
      has_more: offset + limit < filteredMaterials.length
    })

  } catch (error) {
    console.error('Error in pdf-materials API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 新しい教材データを作成（実際の実装ではSupabaseに保存）
    const newMaterial = {
      id: `material-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user',
      created_by_name: { name: '現在のユーザー' },
      pdf_stats: { view_count: 0, download_count: 0 }
    }

    return NextResponse.json({
      message: 'Material created successfully',
      material: newMaterial
    })

  } catch (error) {
    console.error('Error creating material:', error)
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    )
  }
}