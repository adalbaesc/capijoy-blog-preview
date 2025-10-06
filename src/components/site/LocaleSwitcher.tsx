"use client";

import {usePathname, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import type {ChangeEvent} from 'react';
import {locales, type Locale} from '@/i18n/locales';

export default function LocaleSwitcher({value}: {value: Locale}) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const t = useTranslations('language');

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Locale;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length && locales.includes(parts[0] as Locale)) {
      parts[0] = next;
    } else {
      parts.unshift(next);
    }
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    router.push('/' + parts.join('/') + hash);
  }

  return (
    <select
      value={value}
      onChange={onChange}
      className="rounded-md border px-2 py-1 text-sm bg-transparent"
      aria-label={t('title')}
    >
      {locales.map(locale => (
        <option key={locale} value={locale}>
          {t(locale)}
        </option>
      ))}
    </select>
  );
}
