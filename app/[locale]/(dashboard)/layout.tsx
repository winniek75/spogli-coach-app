'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { type Locale } from '@/i18n'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const params = useParams()
  const currentLocale = (params.locale as Locale) || 'ja'

  // Debug logging
  useEffect(() => {
    console.log('Current locale from params:', params.locale)
    console.log('Current locale:', currentLocale)
  }, [params.locale, currentLocale])

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userName="コーチ"
        notificationCount={3}
        currentLocale={currentLocale}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentLocale={currentLocale} />
      <main className="lg:pl-64 pt-14 min-h-[calc(100vh-3.5rem)]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}