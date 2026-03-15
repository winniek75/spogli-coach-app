'use client'

import Link from 'next/link'
import { Video, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ContentPage() {
  const t = useTranslations('contentTop')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/content/videos"
          className="block p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Video className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t('videoList')}</h2>
              <p className="text-muted-foreground mt-1">
                {t('videoListDesc')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/content/materials"
          className="block p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t('materialList')}</h2>
              <p className="text-muted-foreground mt-1">
                {t('materialListDesc')}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{t('statistics')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground">{t('videoCount')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-muted-foreground">{t('materialCount')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-muted-foreground">{t('totalSize')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
