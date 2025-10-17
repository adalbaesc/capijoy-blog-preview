"use client";

import Image from 'next/image';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {ThemeToggle} from '@/components/ui/ThemeToggle';
import LocaleSwitcher from '@/components/site/LocaleSwitcher';
import type {Locale} from '@/i18n/locales';

const links = [
  {href: '#topo', key: 'home', anchor: true},
  {href: '#sobre', key: 'about', anchor: true},
  {href: '#musicas', key: 'music', anchor: true},
  {href: '#conferencias', key: 'conferences', anchor: true},
  {href: '/blog', key: 'blog', anchor: false},
  {href: '#contato', key: 'contact', anchor: true}
] as const;

export default function Navbar({locale}: {locale: Locale}) {
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-40 bg-[var(--header-bg)] shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2" aria-label={t('home')}>
          <Image src="/assets/logo.svg" alt="Logotipo Capí Joy" width={120} height={28} priority className="h-8 w-auto" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm md:flex">
          {links.map(link => (
            <Link
              key={link.key}
              href={`/${locale}${link.href}`}
              className="opacity-80 transition hover:opacity-100"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher value={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
