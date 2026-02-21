'use client'

import { useTranslations } from 'next-intl'
import { SidebarClient } from './sidebar-client'
import { type Locale } from '@/i18n'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
  currentLocale?: Locale
}

export function Sidebar({ isOpen, onClose, currentLocale = 'ja' }: SidebarProps) {
  const tNav = useTranslations('navigation')
  const tSidebar = useTranslations('sidebar')

  const translations = {
    dashboard: tNav('dashboard'),
    students: tNav('students'),
    coaches: tNav('coaches'),
    schedule: tNav('schedule'),
    lessons: tNav('lessons'),
    sports: tNav('sports'),
    content: tNav('content'),
    badges: tNav('badges'),
    notifications: tNav('notifications'),
    print: tNav('print'),
    settings: tNav('settings'),
    shifts: tSidebar('shifts'),
    lessonsSchedule: tSidebar('lessonsSchedule'),
    calendar: tSidebar('calendar'),
    missionSheet: tSidebar('missionSheet'),
    evaluationHistory: tSidebar('evaluationHistory'),
    lessonMenus: tSidebar('lessonMenus'),
    videoList: tSidebar('videoList'),
    materialList: tSidebar('materialList')
  }

  return (
    <SidebarClient
      isOpen={isOpen}
      onClose={onClose}
      translations={translations}
    />
  )
}