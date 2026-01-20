import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateCertificationRequest } from '@/types/coach'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CreateCertificationRequest = await request.json()

    // バリデーション
    if (!body.coach_id || !body.name || !body.issued_date) {
      return NextResponse.json(
        { error: '講師ID、資格名、発行日は必須項目です' },
        { status: 400 }
      )
    }

    // 有効期限に基づいてステータスを決定
    let status = 'valid'
    if (body.expiry_date) {
      const expiryDate = new Date(body.expiry_date)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 0) {
        status = 'expired'
      } else if (daysUntilExpiry <= 30) {
        status = 'expiring_soon'
      }
    }

    const { data: certification, error } = await supabase
      .from('certifications')
      .insert({
        coach_id: body.coach_id,
        name: body.name,
        issued_date: body.issued_date,
        expiry_date: body.expiry_date,
        certificate_url: body.certificate_url,
        status,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating certification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ certification }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}