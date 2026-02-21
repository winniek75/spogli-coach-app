import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateCoachRequest, CoachWithCertifications } from '@/types/coach'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

// デモデータ（メインのroute.tsと同じ）
const demoCoaches: CoachWithCertifications[] = [
  {
    id: '1',
    name: 'Risa',
    name_en: 'Risa Tanaka',
    email: 'risa@spogli.com',
    phone: '090-1111-2222',
    line_id: 'risa_coach',
    nationality: 'Japan',
    languages: ['Japanese', 'English'],
    profile_image_url: null,
    role: 'senior_coach',
    schools: ['ageo', 'okegawa'],
    hire_date: '2023-04-01',
    status: 'active',
    notes: 'バスケットボール専門コーチ',
    certifications: [
      {
        id: '1',
        coach_id: '1',
        name: 'JBA公認C級コーチライセンス',
        issued_date: '2023-06-01',
        expiry_date: '2026-05-31',
        certificate_url: null,
        status: 'valid',
        reminder_sent: false,
        notes: null,
        created_at: '2023-06-01',
        updated_at: '2023-06-01'
      }
    ],
    created_at: '2023-04-01',
    updated_at: '2024-01-20'
  },
  {
    id: '2',
    name: 'Aung',
    name_en: 'Aung Than',
    email: 'aung@spogli.com',
    phone: '090-3333-4444',
    nationality: 'Myanmar',
    languages: ['Burmese', 'English', 'Japanese'],
    profile_image_url: null,
    role: 'coach',
    schools: ['ageo'],
    hire_date: '2023-08-01',
    status: 'active',
    notes: 'サッカー専門コーチ',
    certifications: [
      {
        id: '2',
        coach_id: '2',
        name: 'JFA公認D級コーチライセンス',
        issued_date: '2023-10-01',
        expiry_date: '2025-09-30',
        certificate_url: null,
        status: 'valid',
        reminder_sent: false,
        notes: null,
        created_at: '2023-10-01',
        updated_at: '2023-10-01'
      }
    ],
    created_at: '2023-08-01',
    updated_at: '2024-01-15'
  },
  {
    id: '3',
    name: 'Gecko',
    name_en: 'Gecko Smith',
    email: 'gecko@spogli.com',
    phone: '090-5555-6666',
    nationality: 'USA',
    languages: ['English', 'Japanese'],
    profile_image_url: null,
    role: 'coach',
    schools: ['okegawa'],
    hire_date: '2024-01-10',
    status: 'active',
    notes: 'バレーボール専門コーチ',
    certifications: [],
    created_at: '2024-01-10',
    updated_at: '2024-01-20'
  },
  {
    id: '4',
    name: '田中太郎',
    name_en: 'Taro Tanaka',
    email: 'tanaka@spogli.com',
    phone: '090-7777-8888',
    line_id: 'tanaka_manager',
    nationality: 'Japan',
    languages: ['Japanese'],
    profile_image_url: null,
    role: 'manager',
    schools: ['ageo', 'okegawa'],
    hire_date: '2022-04-01',
    status: 'active',
    notes: 'スクールマネージャー',
    certifications: [],
    created_at: '2022-04-01',
    updated_at: '2024-01-10'
  }
]

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // デモモード: Supabaseが設定されていない場合はデモデータを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const coach = demoCoaches.find(c => c.id === params.id)

      if (!coach) {
        return NextResponse.json({ error: '講師が見つかりません' }, { status: 404 })
      }

      return NextResponse.json({ coach })
    }

    // 本番モード: Supabaseからデータを取得
    const supabase = await createClient()

    const { data: coach, error } = await supabase
      .from('coaches')
      .select(`
        *,
        certifications (*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching coach:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!coach) {
      return NextResponse.json({ error: '講師が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ coach })
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
    // デモモード: 更新をシミュレート
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const body: UpdateCoachRequest = await request.json()
      const coachIndex = demoCoaches.findIndex(c => c.id === params.id)

      if (coachIndex === -1) {
        return NextResponse.json({ error: '講師が見つかりません' }, { status: 404 })
      }

      // デモモードでは実際には更新しないが、成功レスポンスを返す
      const updatedCoach = {
        ...demoCoaches[coachIndex],
        ...body,
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({ coach: updatedCoach })
    }

    // 本番モード: Supabaseでデータを更新
    const supabase = await createClient()
    const body: UpdateCoachRequest = await request.json()

    const { data: coach, error } = await supabase
      .from('coaches')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating coach:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!coach) {
      return NextResponse.json({ error: '講師が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ coach })
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
    // デモモード: 削除をシミュレート
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      const coach = demoCoaches.find(c => c.id === params.id)

      if (!coach) {
        return NextResponse.json({ error: '講師が見つかりません' }, { status: 404 })
      }

      return NextResponse.json({ message: '講師を無効化しました' })
    }

    // 本番モード: Supabaseでデータを更新
    const supabase = await createClient()

    const { error } = await supabase
      .from('coaches')
      .update({ status: 'inactive' })
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting coach:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: '講師を無効化しました' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}