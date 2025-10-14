"use client";

import {useTranslations} from 'next-intl';
import {useTheme} from 'next-themes';
import {useEffect, useState} from 'react';

export function ThemeToggle() {
  const {theme, setTheme} = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('theme');

  useEffect(() => setMounted(true), []);

  const current = mounted ? theme ?? 'system' : 'system';

  return (
    <select
      value={current}
      onChange={event => setTheme(event.target.value)}
      className="rounded-md border border-neutral-300 bg-white/70 px-2 py-1 text-sm text-neutral-800 transition-colors duration-300 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-white"
      aria-label={t('label')}
      disabled={!mounted}
    >
      <option value="light">{t('light')}</option>
      <option value="dark">{t('dark')}</option>
      <option value="system">{t('system')}</option>
    </select>
  );
}
