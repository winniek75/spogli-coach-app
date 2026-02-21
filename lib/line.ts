import { Client } from '@line/bot-sdk'
import { NotificationWithDetails } from '@/types/notification'

// LINE Bot設定
const getConfig = () => ({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
})

// LINE Botクライアントを遅延初期化
let client: Client | null = null

const getClient = (): Client | null => {
  if (!client) {
    const config = getConfig()
    if (config.channelAccessToken && config.channelSecret) {
      client = new Client(config)
    }
  }
  return client
}

// メッセージ送信インターフェース
interface LineMessageOptions {
  userId: string
  notification: NotificationWithDetails
  customMessage?: string
}

interface LineMessageTemplate {
  type: string
  title: string
  text: string
  actions?: LineAction[]
}

interface LineAction {
  type: string
  label: string
  uri?: string
  data?: string
}

// メッセージ送信
export async function sendLineNotification({ userId, notification, customMessage }: LineMessageOptions) {
  try {
    const lineClient = getClient()
    if (!lineClient) {
      throw new Error('LINE Bot is not configured')
    }

    // メッセージ内容を生成
    const message = customMessage || formatNotificationMessage(notification)

    // テキストメッセージ送信
    await lineClient.pushMessage(userId, {
      type: 'text',
      text: message,
    })

    console.log(`LINE notification sent to ${userId}:`, message)
    return { success: true }
  } catch (error) {
    console.error('Failed to send LINE notification:', error)
    throw new Error(error instanceof Error ? error.message : 'LINE送信に失敗しました')
  }
}

// リッチメッセージ送信（フレックスメッセージ）
export async function sendLineRichNotification({ userId, notification }: LineMessageOptions) {
  try {
    const lineClient = getClient()
    if (!lineClient) {
      throw new Error('LINE Bot is not configured')
    }

    const flexMessage = createFlexMessage(notification)

    await lineClient.pushMessage(userId, {
      type: 'flex',
      altText: notification.title,
      contents: flexMessage,
    })

    console.log(`LINE flex notification sent to ${userId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send LINE flex notification:', error)
    throw new Error(error instanceof Error ? error.message : 'LINE リッチメッセージ送信に失敗しました')
  }
}

// 通知メッセージのフォーマット
function formatNotificationMessage(notification: NotificationWithDetails): string {
  const priorityEmoji = getPriorityEmoji(notification.priority)
  const categoryEmoji = getCategoryEmoji(notification.category)

  return `${priorityEmoji}${categoryEmoji} ${notification.title}

${notification.message}

📅 ${new Date(notification.created_at).toLocaleString('ja-JP')}
🔹 カテゴリ: ${getCategoryName(notification.category)}
🔸 優先度: ${getPriorityName(notification.priority)}

📱 Spogli Coach App`
}

// フレックスメッセージ作成
function createFlexMessage(notification: NotificationWithDetails) {
  const priorityColor = getPriorityColor(notification.priority)
  const categoryEmoji = getCategoryEmoji(notification.category)

  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: `${categoryEmoji} ${notification.title}`,
          weight: 'bold',
          size: 'lg',
          wrap: true,
          color: priorityColor,
        },
      ],
      backgroundColor: getPriorityBackgroundColor(notification.priority),
      paddingAll: 'md',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: notification.message,
          wrap: true,
          size: 'md',
          color: '#555555',
        },
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '📅 作成日時',
                  size: 'sm',
                  color: '#888888',
                  flex: 0,
                },
                {
                  type: 'text',
                  text: new Date(notification.created_at).toLocaleString('ja-JP'),
                  size: 'sm',
                  color: '#333333',
                  align: 'end',
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🔹 カテゴリ',
                  size: 'sm',
                  color: '#888888',
                  flex: 0,
                },
                {
                  type: 'text',
                  text: getCategoryName(notification.category),
                  size: 'sm',
                  color: '#333333',
                  align: 'end',
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🔸 優先度',
                  size: 'sm',
                  color: '#888888',
                  flex: 0,
                },
                {
                  type: 'text',
                  text: getPriorityName(notification.priority),
                  size: 'sm',
                  color: priorityColor,
                  weight: 'bold',
                  align: 'end',
                },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: 'アプリで確認',
            uri: `${process.env.NEXT_PUBLIC_APP_URL}/notifications`,
          },
          style: 'primary',
          color: '#0066cc',
        },
      ],
    },
  }
}

// ユーティリティ関数
function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '🚨'
    case 'high':
      return '⚠️'
    case 'medium':
      return 'ℹ️'
    default:
      return '📝'
  }
}

function getCategoryEmoji(category: string): string {
  switch (category) {
    case 'achievement':
      return '🏆'
    case 'reminder':
      return '📅'
    case 'alert':
      return '⚠️'
    case 'update':
      return '📢'
    case 'system':
      return '⚙️'
    default:
      return '📌'
  }
}

function getPriorityName(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '緊急'
    case 'high':
      return '高'
    case 'medium':
      return '中'
    default:
      return '低'
  }
}

function getCategoryName(category: string): string {
  switch (category) {
    case 'achievement':
      return '実績・バッジ'
    case 'reminder':
      return 'リマインダー'
    case 'alert':
      return 'アラート'
    case 'update':
      return '更新情報'
    case 'system':
      return 'システム'
    default:
      return 'その他'
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '#dc2626'
    case 'high':
      return '#ea580c'
    case 'medium':
      return '#2563eb'
    default:
      return '#6b7280'
  }
}

function getPriorityBackgroundColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '#fef2f2'
    case 'high':
      return '#fff7ed'
    case 'medium':
      return '#eff6ff'
    default:
      return '#f9fafb'
  }
}

// Webhook処理（今後の拡張用）
export async function handleLineWebhook(events: any[]) {
  try {
    const results = await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          // メッセージ処理ロジック（今後実装）
          return handleTextMessage(event)
        }
        return null
      })
    )

    return results
  } catch (error) {
    console.error('LINE webhook error:', error)
    throw error
  }
}

// テキストメッセージ処理（今後の拡張用）
async function handleTextMessage(event: any) {
  const lineClient = getClient()
  if (!lineClient) {
    throw new Error('LINE Bot is not configured')
  }

  const { replyToken, message, source } = event
  const userId = source.userId

  // 簡単な応答例
  await lineClient.replyMessage(replyToken, {
    type: 'text',
    text: `メッセージを受信しました: ${message.text}`,
  })

  console.log(`Replied to user ${userId}`)
  return { success: true }
}

// ユーザー情報取得
export async function getLineUserProfile(userId: string) {
  try {
    const lineClient = getClient()
    if (!lineClient) {
      throw new Error('LINE Bot is not configured')
    }

    const profile = await lineClient.getProfile(userId)
    return {
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    }
  } catch (error) {
    console.error('Failed to get LINE user profile:', error)
    throw new Error('ユーザー情報の取得に失敗しました')
  }
}

// LINE ID検証
export async function verifyLineUserId(userId: string): Promise<boolean> {
  try {
    await getLineUserProfile(userId)
    return true
  } catch {
    return false
  }
}