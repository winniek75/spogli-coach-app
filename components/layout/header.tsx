'use client'

import { useTranslations } from 'next-intl'
import { HeaderClient } from './header-client'
import { type Locale } from '@/i18n'

interface HeaderProps {
  onMenuClick: () => void
  userName?: string
  notificationCount?: number
  currentLocale?: Locale
}

export function Header({ onMenuClick, userName, notificationCount = 0, currentLocale = 'ja' }: HeaderProps) {
  const tCommon = useTranslations('common')
  const tNav = useTranslations('navigation')

  const translations = {
    appName: tCommon('appName'),
    coach: tCommon('coach'),
    profile: tNav('profile'),
    settings: tNav('settings'),
    logout: tNav('logout')
  }

  return (
    <HeaderClient
      onMenuClick={onMenuClick}
      userName={userName}
      notificationCount={notificationCount}
      currentLocale={currentLocale}
      translations={translations}
    />
  )
}