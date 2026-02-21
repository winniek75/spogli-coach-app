'use client'

import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations('settings')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t('basicSettings')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('systemName')}</label>
              <input
                type="text"
                value={t('systemNameValue')}
                className="w-full p-2 border rounded-md bg-muted"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('timezone')}</label>
              <select className="w-full p-2 border rounded-md bg-muted" disabled>
                <option>{t('timezoneValue')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t('notificationSettings')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>{t('emailNotifications')}</span>
              <input type="checkbox" className="rounded" disabled />
            </div>
            <div className="flex items-center justify-between">
              <span>{t('lineNotifications')}</span>
              <input type="checkbox" className="rounded" disabled />
            </div>
            <div className="flex items-center justify-between">
              <span>{t('pushNotifications')}</span>
              <input type="checkbox" className="rounded" disabled />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">{t('dataManagement')}</h2>
          <div className="text-center text-muted-foreground py-8">
            <p>{t('dataManagementPending')}</p>
            <p className="text-sm mt-2">{t('dataManagementUpdate')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}