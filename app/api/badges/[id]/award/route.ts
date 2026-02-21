import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
interface RouteParams {
  params: { id: string }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    // デモ実装：バッジを授与済みにマーク
    // 実際の実装ではSupabaseで更新処理を行います
    const updatedBadge = {
      id: params.id,
      awarded_date: body.awarded_date || new Date().toISOString().split('T')[0],
      ceremony_completed: body.ceremony_completed || false,
      notes: body.notes,
      updated_at: new Date().toISOString(),
      // 模擬的な学生データ
      student: {
        id: '1',
        name: '田中太郎',
        level: 3
      }
    }

    return NextResponse.json({
      message: 'Badge awarded successfully',
      badge: updatedBadge
    })
  } catch (error) {
    console.error('Error awarding badge:', error)
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    )
  }
}