import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateCoachRequest } from '@/types/coach'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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