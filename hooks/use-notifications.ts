'use client'

import { useState, useEffect } from 'react'
import {
  Notification,
  NotificationWithDetails,
  CreateNotificationRequest,
  NotificationSettings,
  NotificationType
} from '@/types/notification'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async (filters?: {
    recipient_id?: string
    recipient_type?: string
    is_read?: boolean
    category?: string
    priority?: string
    limit?: number
    offset?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const url = `/api/notifications${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications')
      }

      setNotifications(data.notifications)

      // 未読数をカウント
      const unread = data.notifications.filter((n: NotificationWithDetails) => !n.is_read).length
      setUnreadCount(unread)
    } catch (err) {
      setError(err instanceof Error ? err.message : '通知の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createNotification = async (notificationData: CreateNotificationRequest) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create notification')
      }

      await fetchNotifications()
      return data.notification
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '通知の作成に失敗しました')
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to mark notification as read')
      }

      // ローカル状態を更新
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '通知の既読化に失敗しました')
    }
  }

  const markAllAsRead = async (recipientId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient_id: recipientId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to mark all notifications as read')
      }

      // ローカル状態を更新
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '全通知の既読化に失敗しました')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete notification')
      }

      // ローカル状態を更新
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '通知の削除に失敗しました')
    }
  }

  // 自動通知作成
  const createAutoNotification = async (
    type: NotificationType,
    recipientId: string,
    recipientType: 'coach' | 'parent' | 'admin',
    data: Record<string, any>
  ) => {
    try {
      const response = await fetch('/api/notifications/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          recipient_id: recipientId,
          recipient_type: recipientType,
          data,
        }),
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Failed to create auto notification')
      }

      const responseData = await response.json()
      await fetchNotifications()
      return responseData.notification
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '自動通知の作成に失敗しました')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createAutoNotification,
  }
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async (userId: string, userType: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        user_id: userId,
        user_type: userType,
      })

      const response = await fetch(`/api/notifications/settings?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notification settings')
      }

      setSettings(data.settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : '通知設定の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (settingsData: Partial<NotificationSettings>) => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update notification settings')
      }

      setSettings(data.settings)
      return data.settings
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '通知設定の更新に失敗しました')
    }
  }

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  }
}