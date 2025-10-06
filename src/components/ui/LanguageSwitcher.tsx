'use client';

import {Link, locales} from '@/i18n/routing';
import {useLocale} from 'next-intl';

const LABELS: Record<string, string> = {
  pt: 'PT',
  en: 'EN',
  es: 'ES'
};

export default function LanguageSwitcher() {
  const locale = useLocale();

  return (
    <div className="inline-flex gap-2">
      {locales.map(code => (
        <Link
          key={code}
          locale={code}
          href="/"
          className={`px-2 py-1 rounded ${
            locale === code ? 'bg-amber-500 text-black' : 'bg-transparent border'
          }`}
        >
          {LABELS[code] ?? code.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
