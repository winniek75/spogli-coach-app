'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  CalendarDays,
  ClipboardList,
  Award,
  Video,
  FileText,
  Bell,
  Settings,
  UserCheck,
  Printer,
  Trophy,
} from 'lucide-react'

const menuItems = [
  {
    title: 'ダッシュボード',
    icon: Home,
    href: '/dashboard',
  },
  {
    title: '生徒管理',
    icon: Users,
    href: '/students',
  },
  {
    title: '講師管理',
    icon: UserCheck,
    href: '/coaches',
  },
  {
    title: 'スケジュール',
    icon: CalendarDays,
    href: '/schedule',
    submenu: [
      { title: 'シフト管理', href: '/schedule/shifts' },
      { title: 'レッスン日程', href: '/schedule/lessons' },
      { title: 'カレンダー', href: '/schedule/calendar' },
    ],
  },
  {
    title: 'レッスン',
    icon: ClipboardList,
    href: '/lessons',
    submenu: [
      { title: 'ミッションシート', href: '/lessons/mission' },
      { title: '評価履歴', href: '/lessons/history' },
      { title: 'レッスンメニュー', href: '/lessons/menus' },
    ],
  },
  {
    title: 'スポーツ',
    icon: Trophy,
    href: '/sports',
  },
  {
    title: 'コンテンツ',
    icon: Video,
    href: '/content',
    submenu: [
      { title: '動画一覧', href: '/content/videos' },
      { title: '教材一覧', href: '/content/materials' },
    ],
  },
  {
    title: 'バッジ管理',
    icon: Award,
    href: '/badges',
  },
  {
    title: '通知',
    icon: Bell,
    href: '/notifications',
  },
  {
    title: '印刷',
    icon: Printer,
    href: '/print',
  },
  {
    title: '設定',
    icon: Settings,
    href: '/settings',
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col gap-2 overflow-y-auto p-4">
          {menuItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
                  pathname === item.href && 'bg-accent text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
              {item.submenu && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={onClose}
                      className={cn(
                        'block rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-accent',
                        pathname === subItem.href && 'bg-accent text-accent-foreground'
                      )}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}