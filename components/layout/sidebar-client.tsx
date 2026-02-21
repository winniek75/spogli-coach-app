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
  Bell,
  Settings,
  UserCheck,
  Printer,
  Trophy,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
  translations: {
    dashboard: string
    students: string
    coaches: string
    schedule: string
    lessons: string
    sports: string
    content: string
    badges: string
    notifications: string
    print: string
    settings: string
    shifts: string
    lessonsSchedule: string
    calendar: string
    missionSheet: string
    evaluationHistory: string
    lessonMenus: string
    videoList: string
    materialList: string
  }
}

export function SidebarClient({ isOpen, onClose, translations }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: translations.dashboard,
      icon: Home,
      href: '/dashboard',
    },
    {
      title: translations.students,
      icon: Users,
      href: '/students',
    },
    {
      title: translations.coaches,
      icon: UserCheck,
      href: '/coaches',
    },
    {
      title: translations.schedule,
      icon: CalendarDays,
      href: '/schedule',
      submenu: [
        { title: translations.shifts, href: '/schedule/shifts' },
        { title: translations.lessonsSchedule, href: '/schedule/lessons' },
        { title: translations.calendar, href: '/schedule/calendar' },
      ],
    },
    {
      title: translations.lessons,
      icon: ClipboardList,
      href: '/lessons',
      submenu: [
        { title: translations.evaluationHistory, href: '/lessons/history' },
        { title: translations.lessonMenus, href: '/lessons/menus' },
      ],
    },
    {
      title: translations.missionSheet,
      icon: ClipboardList,
      href: '/missions',
    },
    {
      title: translations.sports,
      icon: Trophy,
      href: '/sports',
    },
    {
      title: translations.content,
      icon: Video,
      href: '/content',
      submenu: [
        { title: translations.videoList, href: '/content/videos' },
        { title: translations.materialList, href: '/content/materials' },
      ],
    },
    {
      title: translations.badges,
      icon: Award,
      href: '/badges',
    },
    {
      title: translations.notifications,
      icon: Bell,
      href: '/notifications',
    },
    {
      title: translations.print,
      icon: Printer,
      href: '/print',
    },
    {
      title: translations.settings,
      icon: Settings,
      href: '/settings',
    },
  ]

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