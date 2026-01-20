import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateCoachRequest, CoachWithCertifications } from '@/types/coach'

export const dynamic = 'force-dynamic'

// デモデータ
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

export async function GET() {
  try {
    // デモモード: Supabaseが設定されていない場合はデモデータを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder')

    if (isDemo) {
      return NextResponse.json({ coaches: demoCoaches })
    }

    // 本番モード: Supabaseからデータを取得
    const supabase = await createClient()

    const { data: coaches, error } = await supabase
      .from('coaches')
      .select(`
        *,
        certifications (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching coaches:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ coaches })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CreateCoachRequest = await request.json()

    // バリデーション
    if (!body.name || !body.email || !body.schools || body.schools.length === 0) {
      return NextResponse.json(
        { error: '名前、メールアドレス、担当校舎は必須項目です' },
        { status: 400 }
      )
    }

    const { data: coach, error } = await supabase
      .from('coaches')
      .insert({
        name: body.name,
        name_en: body.name_en,
        email: body.email,
        phone: body.phone,
        line_id: body.line_id,
        nationality: body.nationality,
        languages: body.languages || [],
        role: body.role || 'coach',
        schools: body.schools,
        hire_date: body.hire_date,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating coach:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ coach }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}