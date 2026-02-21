import { CreateNotificationRequest, NOTIFICATION_TEMPLATES } from '@/types/notification'

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