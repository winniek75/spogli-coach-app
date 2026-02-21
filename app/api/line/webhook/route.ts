import { NextRequest, NextResponse } from 'next/server'
import { handleLineWebhook } from '@/lib/line'
import crypto from 'crypto'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature')

    // 署名検証
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const events = JSON.parse(body).events

    // イベント処理
    await handleLineWebhook(events)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LINE webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// LINE署名検証
function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false

  const channelSecret = process.env.LINE_CHANNEL_SECRET
  if (!channelSecret) return false

  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body, 'utf8')
    .digest('base64')

  return signature === hash
}