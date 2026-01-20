import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateNotificationRequest, NOTIFICATION_TEMPLATES } from '@/types/notification'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const recipientId = searchParams.get('recipient_id')
    const recipientType = searchParams.get('recipient_type')
    const isRead = searchParams.get('is_read')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = supabase
      .from('notifications')
      .select(`
        *,
        recipient_name:coaches!notifications_recipient_id_fkey(name),
        related_student:students!notifications_data_student_id_fkey(id, name),
        related_coach:coaches!notifications_data_coach_id_fkey(id, name)
      `)
      .order('created_at', { ascending: false })

    if (recipientId) {
      query = query.eq('recipient_id', recipientId)
    }

    if (recipientType) {
      query = query.eq('recipient_type', recipientType)
    }

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true')
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || '10') - 1)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // データ整形
    const notificationsWithDetails = notifications?.map(notification => ({
      ...notification,
      recipient_name: notification.recipient_name?.[0]?.name,
      related_student: notification.related_student?.[0],
      related_coach: notification.related_coach?.[0],
    }))

    return NextResponse.json({
      notifications: notificationsWithDetails,
      total: count,
    })
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
    const body: CreateNotificationRequest = await request.json()

    // バリデーション
    if (!body.type || !body.title || !body.message || !body.recipient_id || !body.channels || body.channels.length === 0) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // 通知を作成
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        type: body.type,
        title: body.title,
        message: body.message,
        data: body.data,
        recipient_id: body.recipient_id,
        recipient_type: body.recipient_type,
        channels: body.channels,
        priority: body.priority || 'medium',
        category: body.category,
        expires_at: body.expires_at,
        is_read: false,
        is_sent: !body.send_immediately,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 即座に送信する場合
    if (body.send_immediately) {
      await sendNotification(notification)
    }

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 自動通知作成関数
export async function createAutoNotification(
  type: keyof typeof NOTIFICATION_TEMPLATES,
  recipientId: string,
  recipientType: 'coach' | 'parent' | 'admin',
  data: Record<string, any>
) {
  try {
    const template = NOTIFICATION_TEMPLATES[type]
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`)
    }

    // テンプレートの変数を置換
    let title = template.title
    let message = template.message

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      title = title.replace(new RegExp(placeholder, 'g'), String(value))
      message = message.replace(new RegExp(placeholder, 'g'), String(value))
    })

    const notification: CreateNotificationRequest = {
      type,
      title,
      message,
      data,
      recipient_id: recipientId,
      recipient_type: recipientType,
      channels: template.channels,
      priority: template.priority,
      category: template.category,
      send_immediately: true,
    }

    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    })

    return await response.json()
  } catch (error) {
    console.error('Error creating auto notification:', error)
    throw error
  }
}

// 通知送信処理
async function sendNotification(notification: any) {
  try {
    const supabase = await createClient()

    // 受信者の通知設定を取得
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', notification.recipient_id)
      .eq('user_type', notification.recipient_type)
      .single()

    if (!settings) {
      console.log('No notification settings found for user')
      return
    }

    // 各チャンネルで送信
    const sendPromises = notification.channels.map(async (channel: string) => {
      if (!settings.channels[channel] || !settings.categories[notification.category]) {
        return { channel, status: 'disabled' }
      }

      try {
        switch (channel) {
          case 'email':
            if (settings.email_address) {
              await sendEmail(notification, settings.email_address)
            }
            break
          case 'line':
            if (settings.line_user_id) {
              await sendLineMessage(notification, settings.line_user_id)
            }
            break
          case 'sms':
            if (settings.phone_number) {
              await sendSMS(notification, settings.phone_number)
            }
            break
          case 'app':
            // アプリ内通知は既にデータベースに保存済み
            break
        }
        return { channel, status: 'sent' }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error)
        return { channel, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })

    const results = await Promise.all(sendPromises)

    // 送信状態を更新
    await supabase
      .from('notifications')
      .update({
        is_sent: true,
        sent_at: new Date().toISOString(),
      })
      .eq('id', notification.id)

    // 送信ログを記録
    await supabase
      .from('notification_logs')
      .insert({
        notification_id: notification.id,
        results,
        sent_at: new Date().toISOString(),
      })

    console.log('Notification sent:', { notification_id: notification.id, results })
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

// メール送信
async function sendEmail(notification: any, email: string) {
  try {
    const { sendNotificationEmail } = await import('@/lib/email')

    await sendNotificationEmail({
      to: email,
      notification,
    })

    console.log('Email notification sent:', {
      to: email,
      subject: notification.title,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// LINE送信
async function sendLineMessage(notification: any, lineUserId: string) {
  try {
    const { sendLineNotification } = await import('@/lib/line')

    await sendLineNotification({
      userId: lineUserId,
      notification,
    })

    console.log('LINE notification sent:', {
      to: lineUserId,
      title: notification.title,
    })
  } catch (error) {
    console.error('Failed to send LINE message:', error)
    throw error
  }
}

// SMS送信（実装例）
async function sendSMS(notification: any, phoneNumber: string) {
  // 実際の実装では Twilio などを使用
  console.log('Sending SMS notification:', {
    to: phoneNumber,
    message: `${notification.title}\n${notification.message}`,
  })
  // デモ実装
  return Promise.resolve()
}