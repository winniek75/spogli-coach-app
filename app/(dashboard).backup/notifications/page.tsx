'use client'

import { useState, useEffect } from 'react'
import { useNotifications, useNotificationSettings } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Bell,
  BellOff,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Plus,
  Clock,
  Star,
  AlertTriangle,
  Trophy,
  Calendar,
  Info,
  MoreHorizontal,
} from 'lucide-react'
import { NotificationWithDetails, CreateNotificationRequest } from '@/types/notification'

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    fetchSettings,
    updateSettings,
  } = useNotificationSettings()

  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // フィルター処理
  const handleFilterChange = () => {
    const filters: any = {}

    if (categoryFilter) filters.category = categoryFilter
    if (priorityFilter) filters.priority = priorityFilter
    if (readFilter) filters.is_read = readFilter === 'read'

    fetchNotifications(filters)
  }

  useEffect(() => {
    // ダミーのユーザーIDでテスト（実際の実装では認証システムから取得）
    fetchSettings('test-user-id', 'coach')
  }, [])

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high':
        return <Star className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'reminder':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">通知を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              通知管理
            </h1>
            <p className="text-muted-foreground mt-2">
              システム通知の確認・管理
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                  {unreadCount}件の未読
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead('test-user-id')}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              すべて既読
            </Button>
          )}

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                通知作成
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <CreateNotificationForm
                onSubmit={async (data) => {
                  await createNotification(data)
                  setShowCreateDialog(false)
                }}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                設定
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <NotificationSettingsForm
                settings={settings}
                loading={settingsLoading}
                onSubmit={async (data) => {
                  await updateSettings(data)
                  setShowSettingsDialog(false)
                }}
                onCancel={() => setShowSettingsDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="achievement">実績</SelectItem>
                <SelectItem value="reminder">リマインダー</SelectItem>
                <SelectItem value="alert">アラート</SelectItem>
                <SelectItem value="update">更新</SelectItem>
                <SelectItem value="system">システム</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="優先度で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="urgent">緊急</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>

            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger>
                <SelectValue placeholder="既読状態で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="unread">未読</SelectItem>
                <SelectItem value="read">既読</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleFilterChange}>
              <Filter className="h-4 w-4 mr-2" />
              絞り込み
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 通知一覧 */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            通知がありません
          </p>
          <p className="text-muted-foreground">
            フィルター条件を変更するか、新しい通知を作成してください
          </p>
        </div>
      )}
    </div>
  )
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationWithDetails
  onMarkAsRead: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high':
        return <Star className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'reminder':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className={`transition-all ${!notification.is_read ? 'border-blue-200 bg-blue-50/50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(notification.category)}
              <h3 className="text-lg font-semibold">{notification.title}</h3>
              <Badge variant="outline" className={getPriorityBadgeColor(notification.priority)}>
                {notification.priority}
              </Badge>
              {!notification.is_read && (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  未読
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-3">{notification.message}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{new Date(notification.created_at).toLocaleString('ja-JP')}</span>
              <span>カテゴリ: {notification.category}</span>
              {notification.channels && (
                <div className="flex items-center gap-1">
                  <span>送信先:</span>
                  {notification.channels.includes('app') && <Bell className="h-3 w-3" />}
                  {notification.channels.includes('email') && <Mail className="h-3 w-3" />}
                  {notification.channels.includes('line') && <MessageSquare className="h-3 w-3" />}
                  {notification.channels.includes('sms') && <Smartphone className="h-3 w-3" />}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.is_read && (
                <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                  <Check className="h-4 w-4 mr-2" />
                  既読にする
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(notification.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateNotificationForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: CreateNotificationRequest) => Promise<void>
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<CreateNotificationRequest>({
    type: 'custom',
    title: '',
    message: '',
    recipient_id: 'test-user-id',
    recipient_type: 'coach',
    channels: ['app'],
    priority: 'medium',
    category: 'update',
    send_immediately: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>新しい通知を作成</DialogTitle>
        <DialogDescription>
          通知の詳細を入力してください
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="通知のタイトル"
            required
          />
        </div>

        <div>
          <Label htmlFor="message">メッセージ</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="通知の内容"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">優先度</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">低</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="urgent">緊急</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">カテゴリ</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="achievement">実績</SelectItem>
                <SelectItem value="reminder">リマインダー</SelectItem>
                <SelectItem value="alert">アラート</SelectItem>
                <SelectItem value="update">更新</SelectItem>
                <SelectItem value="system">システム</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">作成</Button>
        </DialogFooter>
      </form>
    </>
  )
}

function NotificationSettingsForm({
  settings,
  loading,
  onSubmit,
  onCancel,
}: {
  settings: any
  loading: boolean
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(settings || {
    channels: { app: true, email: false, line: false, sms: false },
    categories: { achievement: true, reminder: true, alert: true, update: false, system: true },
    quiet_hours: { enabled: false, start_time: '22:00', end_time: '08:00' },
  })

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      user_id: 'test-user-id',
      user_type: 'coach',
    })
  }

  if (loading) {
    return <div>設定を読み込んでいます...</div>
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>通知設定</DialogTitle>
        <DialogDescription>
          通知の受信方法や頻度を設定できます
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="text-base font-medium">通知チャンネル</Label>
          <div className="space-y-3 mt-3">
            {Object.entries(formData.channels || {}).map(([channel, enabled]) => (
              <div key={channel} className="flex items-center justify-between">
                <Label htmlFor={channel} className="flex items-center gap-2">
                  {channel === 'app' && <Bell className="h-4 w-4" />}
                  {channel === 'email' && <Mail className="h-4 w-4" />}
                  {channel === 'line' && <MessageSquare className="h-4 w-4" />}
                  {channel === 'sms' && <Smartphone className="h-4 w-4" />}
                  {channel === 'app' ? 'アプリ内通知' :
                   channel === 'email' ? 'メール' :
                   channel === 'line' ? 'LINE' : 'SMS'}
                </Label>
                <Switch
                  id={channel}
                  checked={enabled as boolean}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      channels: { ...formData.channels, [channel]: checked }
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">通知カテゴリ</Label>
          <div className="space-y-3 mt-3">
            {Object.entries(formData.categories || {}).map(([category, enabled]) => (
              <div key={category} className="flex items-center justify-between">
                <Label htmlFor={`cat-${category}`}>
                  {category === 'achievement' ? '実績・バッジ' :
                   category === 'reminder' ? 'リマインダー' :
                   category === 'alert' ? 'アラート' :
                   category === 'update' ? '更新情報' : 'システム'}
                </Label>
                <Switch
                  id={`cat-${category}`}
                  checked={enabled as boolean}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      categories: { ...formData.categories, [category]: checked }
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </form>
    </>
  )
}