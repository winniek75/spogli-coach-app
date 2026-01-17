export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  recipient_id: string
  recipient_type: 'coach' | 'parent' | 'admin'
  is_read: boolean
  is_sent: boolean
  sent_at?: string
  channels: NotificationChannel[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: NotificationCategory
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface NotificationWithDetails extends Notification {
  recipient_name?: string
  related_student?: {
    id: string
    name: string
  }
  related_coach?: {
    id: string
    name: string
  }
}

export interface CreateNotificationRequest {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  recipient_id: string
  recipient_type: 'coach' | 'parent' | 'admin'
  channels: NotificationChannel[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category: NotificationCategory
  expires_at?: string
  send_immediately?: boolean
}

export type NotificationType =
  | 'badge_earned'
  | 'badge_awarded'
  | 'certification_expiring'
  | 'certification_expired'
  | 'lesson_reminder'
  | 'evaluation_completed'
  | 'mission_completed'
  | 'attendance_reminder'
  | 'schedule_change'
  | 'new_content'
  | 'system_alert'
  | 'custom'

export type NotificationChannel = 'app' | 'email' | 'line' | 'sms'

export type NotificationCategory =
  | 'achievement'
  | 'reminder'
  | 'alert'
  | 'update'
  | 'system'

export interface NotificationSettings {
  id: string
  user_id: string
  user_type: 'coach' | 'parent' | 'admin'
  channels: {
    app: boolean
    email: boolean
    line: boolean
    sms: boolean
  }
  categories: {
    achievement: boolean
    reminder: boolean
    alert: boolean
    update: boolean
    system: boolean
  }
  quiet_hours: {
    enabled: boolean
    start_time: string
    end_time: string
  }
  email_address?: string
  line_user_id?: string
  phone_number?: string
  created_at: string
  updated_at: string
}

export interface NotificationTemplate {
  id: string
  type: NotificationType
  title_template: string
  message_template: string
  default_channels: NotificationChannel[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: NotificationCategory
  is_active: boolean
  variables: string[]
  created_at: string
  updated_at: string
}

// バッジ獲得通知のデータ構造
export interface BadgeEarnedNotificationData {
  badge_id: string
  student_id: string
  student_name: string
  badge_type: string
  sport: string
  category: string
}

// 資格期限通知のデータ構造
export interface CertificationExpiringNotificationData {
  coach_id: string
  coach_name: string
  certification_name: string
  expiry_date: string
  days_remaining: number
}

// レッスンリマインダーのデータ構造
export interface LessonReminderNotificationData {
  lesson_id?: string
  student_id: string
  student_name: string
  lesson_date: string
  lesson_time: string
  coach_name: string
  sport: string
}

// 通知テンプレート定数
export const NOTIFICATION_TEMPLATES = {
  badge_earned: {
    title: '🏆 バッジ獲得おめでとうございます！',
    message: '{student_name}さんが{sport}の{category}バッジを獲得しました！',
    channels: ['app', 'email', 'line'] as NotificationChannel[],
    priority: 'medium' as const,
    category: 'achievement' as const,
  },
  badge_awarded: {
    title: '🎉 バッジ授与のお知らせ',
    message: '{student_name}さんに{sport}の{category}バッジが授与されました。',
    channels: ['app', 'email', 'line'] as NotificationChannel[],
    priority: 'medium' as const,
    category: 'achievement' as const,
  },
  certification_expiring: {
    title: '⚠️ 資格更新のお知らせ',
    message: '{coach_name}コーチの{certification_name}が{days_remaining}日後に期限切れになります。',
    channels: ['app', 'email'] as NotificationChannel[],
    priority: 'high' as const,
    category: 'alert' as const,
  },
  lesson_reminder: {
    title: '📅 レッスンのお知らせ',
    message: '{student_name}さんのレッスンが{lesson_date} {lesson_time}に予定されています。',
    channels: ['app', 'email', 'line'] as NotificationChannel[],
    priority: 'medium' as const,
    category: 'reminder' as const,
  },
} as const