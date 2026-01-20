import { NextRequest, NextResponse } from 'next/server'
import { sendLineNotification, sendLineRichNotification } from '@/lib/line'
import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    if (!body.user_id || !body.notification_id) {
      return NextResponse.json(
        { error: 'user_id と notification_id が必要です' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 通知データを取得
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', body.notification_id)
      .single()

    if (notificationError || !notification) {
      return NextResponse.json(
        { error: '通知が見つかりません' },
        { status: 404 }
      )
    }

    // ユーザーのLINE設定を取得
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('line_user_id')
      .eq('user_id', body.user_id)
      .single()

    if (settingsError || !settings?.line_user_id) {
      return NextResponse.json(
        { error: 'LINE設定が見つかりません' },
        { status: 404 }
      )
    }

    // メッセージタイプを決定
    const useRichMessage = body.rich_message !== false &&
      ['achievement', 'alert'].includes(notification.category)

    // LINE送信
    let result
    if (useRichMessage) {
      result = await sendLineRichNotification({
        userId: settings.line_user_id,
        notification,
        customMessage: body.custom_message,
      })
    } else {
      result = await sendLineNotification({
        userId: settings.line_user_id,
        notification,
        customMessage: body.custom_message,
      })
    }

    // 送信ログを記録
    await supabase
      .from('notification_logs')
      .insert({
        notification_id: body.notification_id,
        channel: 'line',
        recipient_id: body.user_id,
        success: result.success,
        sent_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      message: 'LINE通知を送信しました',
      rich_message: useRichMessage,
    })
  } catch (error) {
    console.error('LINE send error:', error)

    // エラーログを記録
    const supabase = await createClient()
    if (request.body) {
      const body = await request.json()
      await supabase
        .from('notification_logs')
        .insert({
          notification_id: body.notification_id,
          channel: 'line',
          recipient_id: body.user_id,
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          sent_at: new Date().toISOString(),
        })
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'LINE送信に失敗しました'
      },
      { status: 500 }
    )
  }
}