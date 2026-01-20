import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NotificationSettings } from '@/types/notification'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('user_id')
    const userType = searchParams.get('user_type')

    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'user_id と user_type が必要です' },
        { status: 400 }
      )
    }

    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification settings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // デフォルト設定を返す（設定が存在しない場合）
    if (!settings) {
      const defaultSettings: Partial<NotificationSettings> = {
        user_id: userId,
        user_type: userType as 'coach' | 'parent' | 'admin',
        channels: {
          app: true,
          email: false,
          line: false,
          sms: false,
        },
        categories: {
          achievement: true,
          reminder: true,
          alert: true,
          update: false,
          system: true,
        },
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00',
        },
      }

      return NextResponse.json({ settings: defaultSettings })
    }

    return NextResponse.json({ settings })
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
    const body: Partial<NotificationSettings> = await request.json()

    // バリデーション
    if (!body.user_id || !body.user_type) {
      return NextResponse.json(
        { error: 'user_id と user_type が必要です' },
        { status: 400 }
      )
    }

    // 既存設定をチェック
    const { data: existing } = await supabase
      .from('notification_settings')
      .select('id')
      .eq('user_id', body.user_id)
      .eq('user_type', body.user_type)
      .single()

    let result
    if (existing) {
      // 更新
      const { data, error } = await supabase
        .from('notification_settings')
        .update({
          channels: body.channels,
          categories: body.categories,
          quiet_hours: body.quiet_hours,
          email_address: body.email_address,
          line_user_id: body.line_user_id,
          phone_number: body.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', body.user_id)
        .eq('user_type', body.user_type)
        .select()
        .single()

      if (error) {
        console.error('Error updating notification settings:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      result = data
    } else {
      // 新規作成
      const { data, error } = await supabase
        .from('notification_settings')
        .insert({
          user_id: body.user_id,
          user_type: body.user_type,
          channels: body.channels || {
            app: true,
            email: false,
            line: false,
            sms: false,
          },
          categories: body.categories || {
            achievement: true,
            reminder: true,
            alert: true,
            update: false,
            system: true,
          },
          quiet_hours: body.quiet_hours || {
            enabled: false,
            start_time: '22:00',
            end_time: '08:00',
          },
          email_address: body.email_address,
          line_user_id: body.line_user_id,
          phone_number: body.phone_number,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating notification settings:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({ settings: result }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}