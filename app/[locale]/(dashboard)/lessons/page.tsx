'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function LessonsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  useEffect(() => {
    // Redirect to mission sheet as the default lessons page
    router.replace(`/${locale}/lessons/mission`)
  }, [locale, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}