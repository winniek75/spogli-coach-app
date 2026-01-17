import { Resend } from 'resend'
import { NotificationWithDetails } from '@/types/notification'

// Resend設定
const resend = new Resend(process.env.RESEND_API_KEY)

// メール送信インターフェース
interface EmailOptions {
  to: string | string[]
  subject: string
  content: string
  html?: string
  from?: string
  replyTo?: string
}

interface NotificationEmailOptions {
  to: string | string[]
  notification: NotificationWithDetails
  customSubject?: string
  customMessage?: string
  includeAppLink?: boolean
}

interface LessonMenuEmailOptions {
  to: string | string[]
  lessonMenu: any
  shareUrl: string
  message?: string
  sharedBy: string
}

// 基本的なメール送信
export async function sendEmail({
  to,
  subject,
  content,
  html,
  from = `Spogli Coach App <${process.env.FROM_EMAIL || 'noreply@spoglicoach.com'}>`,
  replyTo,
}: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text: content,
      html: html || generateHtmlFromText(content),
      replyTo,
    })

    console.log('Email sent successfully:', data)
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error(error instanceof Error ? error.message : 'メール送信に失敗しました')
  }
}

// 通知メール送信
export async function sendNotificationEmail({
  to,
  notification,
  customSubject,
  customMessage,
  includeAppLink = true,
}: NotificationEmailOptions) {
  const subject = customSubject || `【Spogli Coach App】${notification.title}`

  const content = customMessage || `
${notification.title}

${notification.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 通知詳細:
• カテゴリ: ${getCategoryDisplayName(notification.category)}
• 優先度: ${getPriorityDisplayName(notification.priority)}
• 作成日時: ${new Date(notification.created_at).toLocaleString('ja-JP')}

${includeAppLink ? `
🔗 詳細を確認:
${process.env.NEXT_PUBLIC_APP_URL}/notifications

` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

このメールは Spogli Coach App より自動送信されました。
ご不明な点がございましたら、サポートまでお問い合わせください。

Spogli Coach App
${process.env.NEXT_PUBLIC_APP_URL}
  `.trim()

  const html = generateNotificationHtml(notification, customMessage, includeAppLink)

  return await sendEmail({
    to,
    subject,
    content,
    html,
  })
}

// レッスンメニュー共有メール
export async function sendLessonMenuEmail({
  to,
  lessonMenu,
  shareUrl,
  message,
  sharedBy,
}: LessonMenuEmailOptions) {
  const subject = `【Spogli Coach App】レッスンメニュー「${lessonMenu.title}」が共有されました`

  const content = `
こんにちは,

${sharedBy}さんからレッスンメニューが共有されました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 レッスンメニュー詳細:
タイトル: ${lessonMenu.title}
スポーツ: ${lessonMenu.sport}
レベル: Lv${lessonMenu.level}
時間: ${lessonMenu.duration_minutes}分
参加者数: ${lessonMenu.max_participants}名

${lessonMenu.description ? `説明: ${lessonMenu.description}\n\n` : ''}${message ? `💬 メッセージ:\n${message}\n\n` : ''}🔗 レッスンメニューを確認:
${shareUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※このリンクは一定期間で無効になります。

Spogli Coach App
${process.env.NEXT_PUBLIC_APP_URL}
  `.trim()

  const html = generateLessonMenuHtml(lessonMenu, shareUrl, message, sharedBy)

  return await sendEmail({
    to,
    subject,
    content,
    html,
  })
}

// バッジ獲得通知メール
export async function sendBadgeEarnedEmail(
  to: string | string[],
  data: {
    studentName: string
    sport: string
    badgeType: string
    category: string
    coachName?: string
  }
) {
  const subject = `🏆【Spogli Coach App】${data.studentName}さんがバッジを獲得しました！`

  const content = `
おめでとうございます！

${data.studentName}さんが新しいバッジを獲得しました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 獲得バッジ:
• スポーツ: ${data.sport}
• カテゴリ: ${data.category}
• バッジタイプ: ${data.badgeType}
${data.coachName ? `• 指導コーチ: ${data.coachName}` : ''}

この成果は日々の努力と練習の賜物です。
引き続き頑張っていきましょう！

🔗 詳細を確認:
${process.env.NEXT_PUBLIC_APP_URL}/students/progress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Spogli Coach App
${process.env.NEXT_PUBLIC_APP_URL}
  `.trim()

  const html = generateBadgeEarnedHtml(data)

  return await sendEmail({
    to,
    subject,
    content,
    html,
  })
}

// 資格期限アラートメール
export async function sendCertificationExpiringEmail(
  to: string | string[],
  data: {
    coachName: string
    certificationName: string
    expiryDate: string
    daysRemaining: number
  }
) {
  const subject = `⚠️【Spogli Coach App】資格更新のお知らせ - ${data.certificationName}`

  const content = `
${data.coachName}コーチ

お疲れ様です。
資格の更新期限が近づいておりますのでお知らせいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 資格期限アラート:
• 資格名: ${data.certificationName}
• 期限日: ${data.expiryDate}
• 残り日数: ${data.daysRemaining}日

お早めに更新手続きをお済ませください。

🔗 資格管理ページ:
${process.env.NEXT_PUBLIC_APP_URL}/coaches/certifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたら、管理者までお問い合わせください。

Spogli Coach App
${process.env.NEXT_PUBLIC_APP_URL}
  `.trim()

  const html = generateCertificationExpiringHtml(data)

  return await sendEmail({
    to,
    subject,
    content,
    html,
  })
}

// HTML生成関数
function generateHtmlFromText(text: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spogli Coach App</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
    .button { display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .highlight { background: #e6f3ff; padding: 15px; border-left: 4px solid #0066cc; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Spogli Coach App</h2>
  </div>
  <div class="content">
    ${text.replace(/\n/g, '<br>')}
  </div>
  <div class="footer">
    このメールは Spogli Coach App より自動送信されました。<br>
    © 2024 Spogli Coach App. All rights reserved.
  </div>
</body>
</html>
  `.trim()
}

function generateNotificationHtml(
  notification: NotificationWithDetails,
  customMessage?: string,
  includeAppLink = true
): string {
  const priorityColor = getPriorityColor(notification.priority)
  const categoryEmoji = getCategoryEmoji(notification.category)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notification.title} - Spogli Coach App</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${priorityColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .notification-body { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .details { background: #f0f8ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .button { display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
    .priority { color: ${priorityColor}; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${categoryEmoji} ${notification.title}</h2>
  </div>
  <div class="content">
    <div class="notification-body">
      <p>${(customMessage || notification.message).replace(/\n/g, '<br>')}</p>
    </div>

    <div class="details">
      <h4>📋 通知詳細</h4>
      <ul>
        <li><strong>カテゴリ:</strong> ${getCategoryDisplayName(notification.category)}</li>
        <li><strong>優先度:</strong> <span class="priority">${getPriorityDisplayName(notification.priority)}</span></li>
        <li><strong>作成日時:</strong> ${new Date(notification.created_at).toLocaleString('ja-JP')}</li>
      </ul>
    </div>

    ${includeAppLink ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/notifications" class="button">
        📱 アプリで詳細を確認
      </a>
    </div>
    ` : ''}
  </div>
  <div class="footer">
    このメールは Spogli Coach App より自動送信されました。<br>
    © 2024 Spogli Coach App. All rights reserved.
  </div>
</body>
</html>
  `.trim()
}

function generateLessonMenuHtml(
  lessonMenu: any,
  shareUrl: string,
  message?: string,
  sharedBy?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>レッスンメニュー共有 - Spogli Coach App</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .menu-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .message-box { background: #e6f3ff; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; }
    .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h2>📚 レッスンメニュー共有</h2>
  </div>
  <div class="content">
    <p>こんにちは,</p>
    <p>${sharedBy}さんからレッスンメニューが共有されました。</p>

    <div class="menu-details">
      <h3>📋 ${lessonMenu.title}</h3>
      ${lessonMenu.description ? `<p><strong>説明:</strong> ${lessonMenu.description}</p>` : ''}
      <ul>
        <li><strong>スポーツ:</strong> ${lessonMenu.sport}</li>
        <li><strong>レベル:</strong> Lv${lessonMenu.level}</li>
        <li><strong>時間:</strong> ${lessonMenu.duration_minutes}分</li>
        <li><strong>参加者数:</strong> ${lessonMenu.max_participants}名</li>
      </ul>
    </div>

    ${message ? `
    <div class="message-box">
      <h4>💬 メッセージ</h4>
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${shareUrl}" class="button">
        📖 レッスンメニューを確認
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">
      ※このリンクは一定期間で無効になります。
    </p>
  </div>
  <div class="footer">
    このメールは Spogli Coach App より自動送信されました。<br>
    © 2024 Spogli Coach App. All rights reserved.
  </div>
</body>
</html>
  `.trim()
}

function generateBadgeEarnedHtml(data: {
  studentName: string
  sport: string
  badgeType: string
  category: string
  coachName?: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>バッジ獲得おめでとうございます！ - Spogli Coach App</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .badge-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .congratulations { background: #ecfdf5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏆 バッジ獲得おめでとうございます！</h1>
    <h2>${data.studentName}さん</h2>
  </div>
  <div class="content">
    <div class="congratulations">
      <h3>🎉 新しいバッジを獲得しました！</h3>
      <p>日々の努力と練習の成果が実りました。素晴らしい成果です！</p>
    </div>

    <div class="badge-info">
      <h3>🏆 獲得バッジ詳細</h3>
      <ul style="text-align: left; display: inline-block;">
        <li><strong>スポーツ:</strong> ${data.sport}</li>
        <li><strong>カテゴリ:</strong> ${data.category}</li>
        <li><strong>バッジタイプ:</strong> ${data.badgeType}</li>
        ${data.coachName ? `<li><strong>指導コーチ:</strong> ${data.coachName}</li>` : ''}
      </ul>
    </div>

    <p style="text-align: center; font-size: 18px; color: #059669; font-weight: bold;">
      引き続き頑張っていきましょう！
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/students/progress" class="button">
        🏆 進捗を確認
      </a>
    </div>
  </div>
  <div class="footer">
    このメールは Spogli Coach App より自動送信されました。<br>
    © 2024 Spogli Coach App. All rights reserved.
  </div>
</body>
</html>
  `.trim()
}

function generateCertificationExpiringHtml(data: {
  coachName: string
  certificationName: string
  expiryDate: string
  daysRemaining: number
}): string {
  const urgencyColor = data.daysRemaining <= 7 ? '#dc2626' : data.daysRemaining <= 30 ? '#ea580c' : '#2563eb'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>資格更新のお知らせ - Spogli Coach App</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${urgencyColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .alert-box { background: #fef2f2; border: 2px solid ${urgencyColor}; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cert-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
    .urgent { color: ${urgencyColor}; font-weight: bold; font-size: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>⚠️ 資格更新のお知らせ</h2>
  </div>
  <div class="content">
    <p>${data.coachName}コーチ</p>
    <p>お疲れ様です。<br>資格の更新期限が近づいておりますのでお知らせいたします。</p>

    <div class="alert-box">
      <h3 style="color: ${urgencyColor};">⚠️ 資格期限アラート</h3>
      <p class="urgent">残り ${data.daysRemaining} 日で期限切れになります</p>
    </div>

    <div class="cert-details">
      <h4>📋 資格詳細</h4>
      <ul>
        <li><strong>資格名:</strong> ${data.certificationName}</li>
        <li><strong>期限日:</strong> ${data.expiryDate}</li>
        <li><strong>残り日数:</strong> <span style="color: ${urgencyColor}; font-weight: bold;">${data.daysRemaining}日</span></li>
      </ul>
    </div>

    <p style="text-align: center; font-weight: bold;">
      お早めに更新手続きをお済ませください。
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/coaches/certifications" class="button">
        📋 資格管理ページ
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">
      ご不明な点がございましたら、管理者までお問い合わせください。
    </p>
  </div>
  <div class="footer">
    このメールは Spogli Coach App より自動送信されました。<br>
    © 2024 Spogli Coach App. All rights reserved.
  </div>
</body>
</html>
  `.trim()
}

// ユーティリティ関数
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

function getPriorityDisplayName(priority: string): string {
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

function getCategoryDisplayName(category: string): string {
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

// メール設定検証
export async function verifyEmailConfiguration(): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    // テスト送信（実際には送信しない）
    console.log('Email configuration verified')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}