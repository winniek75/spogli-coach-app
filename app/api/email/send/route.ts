import { NextRequest, NextResponse } from 'next/server'
import {
  sendEmail,
  sendNotificationEmail,
  sendBadgeEarnedEmail,
  sendCertificationExpiringEmail,
} from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    if (!body.type) {
      return NextResponse.json(
        { error: 'メール種別が指定されていません' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    switch (body.type) {
      case 'notification':
        return await handleNotificationEmail(body, supabase)
      case 'badge_earned':
        return await handleBadgeEarnedEmail(body)
      case 'certification_expiring':
        return await handleCertificationExpiringEmail(body)
      case 'basic':
        return await handleBasicEmail(body)
      default:
        return NextResponse.json(
          { error: '不明なメール種別です' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'メール送信に失敗しました'
      },
      { status: 500 }
    )
  }
}

// 通知メール処理
async function handleNotificationEmail(body: any, supabase: any) {
  const { notification_id, to, custom_subject, custom_message, include_app_link = true } = body

  if (!notification_id || !to) {
    return NextResponse.json(
      { error: 'notification_id と to が必要です' },
      { status: 400 }
    )
  }

  // 通知データを取得
  const { data: notification, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notification_id)
    .single()

  if (error || !notification) {
    return NextResponse.json(
      { error: '通知が見つかりません' },
      { status: 404 }
    )
  }

  const result = await sendNotificationEmail({
    to,
    notification,
    customSubject: custom_subject,
    customMessage: custom_message,
    includeAppLink: include_app_link,
  })

  // 送信ログを記録
  await supabase
    .from('notification_logs')
    .insert({
      notification_id,
      channel: 'email',
      recipient_email: Array.isArray(to) ? to.join(',') : to,
      success: result.success,
      message_id: result.messageId,
      sent_at: new Date().toISOString(),
    })

  return NextResponse.json({
    success: true,
    message: 'メール通知を送信しました',
    messageId: result.messageId,
  })
}

// バッジ獲得メール処理
async function handleBadgeEarnedEmail(body: any) {
  const { to, student_name, sport, badge_type, category, coach_name } = body

  if (!to || !student_name || !sport || !badge_type || !category) {
    return NextResponse.json(
      { error: '必須パラメータが不足しています' },
      { status: 400 }
    )
  }

  const result = await sendBadgeEarnedEmail(to, {
    studentName: student_name,
    sport,
    badgeType: badge_type,
    category,
    coachName: coach_name,
  })

  return NextResponse.json({
    success: true,
    message: 'バッジ獲得メールを送信しました',
    messageId: result.messageId,
  })
}

// 資格期限メール処理
async function handleCertificationExpiringEmail(body: any) {
  const { to, coach_name, certification_name, expiry_date, days_remaining } = body

  if (!to || !coach_name || !certification_name || !expiry_date || days_remaining === undefined) {
    return NextResponse.json(
      { error: '必須パラメータが不足しています' },
      { status: 400 }
    )
  }

  const result = await sendCertificationExpiringEmail(to, {
    coachName: coach_name,
    certificationName: certification_name,
    expiryDate: expiry_date,
    daysRemaining: days_remaining,
  })

  return NextResponse.json({
    success: true,
    message: '資格期限メールを送信しました',
    messageId: result.messageId,
  })
}

// 基本メール処理
async function handleBasicEmail(body: any) {
  const { to, subject, content, html, reply_to } = body

  if (!to || !subject || !content) {
    return NextResponse.json(
      { error: 'to, subject, content が必要です' },
      { status: 400 }
    )
  }

  const result = await sendEmail({
    to,
    subject,
    content,
    html,
    replyTo: reply_to,
  })

  return NextResponse.json({
    success: true,
    message: 'メールを送信しました',
    messageId: result.messageId,
  })
}