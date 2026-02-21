import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // バリデーション
    if (!body.emails || !Array.isArray(body.emails) || body.emails.length === 0) {
      return NextResponse.json(
        { error: 'メールアドレスが指定されていません' },
        { status: 400 }
      )
    }

    // レッスンメニューの詳細を取得
    const { data: lessonMenu, error: menuError } = await supabase
      .from('lesson_menus')
      .select(`
        *,
        created_by_name:coaches!lesson_menus_created_by_fkey(name),
        activities:lesson_activities!lesson_activities_lesson_menu_id_fkey(*)
      `)
      .eq('id', params.id)
      .single()

    if (menuError || !lessonMenu) {
      console.error('Error fetching lesson menu:', menuError)
      return NextResponse.json({ error: 'レッスンメニューが見つかりません' }, { status: 404 })
    }

    // 公開メニューでない場合はアクセス権限をチェック
    const { data: { user } } = await supabase.auth.getUser()
    if (!lessonMenu.is_public && lessonMenu.created_by !== user?.id) {
      return NextResponse.json({ error: '共有権限がありません' }, { status: 403 })
    }

    // 共有URLを生成（トークンベース）
    const shareToken = generateShareToken()
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/shared/lesson-menus/${params.id}?token=${shareToken}`

    // 共有記録を保存
    await supabase
      .from('lesson_menu_shares')
      .insert({
        lesson_menu_id: params.id,
        shared_by: user?.id,
        shared_emails: body.emails,
        share_token: shareToken,
        message: body.message,
        expires_at: body.expires_days ?
          new Date(Date.now() + body.expires_days * 24 * 60 * 60 * 1000).toISOString() :
          null,
      })

    // メール送信処理（実際の実装ではメールサービスを使用）
    const emailResults = await Promise.all(
      body.emails.map(async (email: string) => {
        try {
          await sendLessonMenuEmail({
            to: email,
            lessonMenu,
            shareUrl,
            message: body.message,
            sharedBy: lessonMenu.created_by_name?.[0]?.name || 'Unknown',
          })
          return { email, status: 'sent' }
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error)
          return { email, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
        }
      })
    )

    return NextResponse.json({
      shareUrl,
      emailResults,
      message: 'レッスンメニューを共有しました'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 共有トークン生成
function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

// メール送信
async function sendLessonMenuEmail({
  to,
  lessonMenu,
  shareUrl,
  message,
  sharedBy,
}: {
  to: string
  lessonMenu: any
  shareUrl: string
  message?: string
  sharedBy: string
}) {
  try {
    const { sendLessonMenuEmail: sendEmail } = await import('@/lib/email')

    await sendEmail({
      to,
      lessonMenu,
      shareUrl,
      message,
      sharedBy,
    })

    console.log('Lesson menu email sent:', {
      to,
      lessonMenu: lessonMenu.title,
      sharedBy,
    })
  } catch (error) {
    console.error('Failed to send lesson menu email:', error)
    throw error
  }
}