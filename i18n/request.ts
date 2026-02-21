import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from '../i18n';

export default getRequestConfig(async ({locale}) => {
  // Use default locale if locale is undefined
  const currentLocale = locale || defaultLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(currentLocale as any)) notFound();

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default
  };
});