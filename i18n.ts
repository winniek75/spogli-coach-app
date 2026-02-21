import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['ja', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ja'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  try {
    return {
      messages: (await import(`./messages/${locale}.json`)).default
    }
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error)
    notFound()
  }
})