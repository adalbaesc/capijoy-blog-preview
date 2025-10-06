import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import type {ReactNode} from 'react';
import {locales, type Locale, defaultLocale} from '@/i18n/locales';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import {ThemeProvider} from '@/components/providers/theme-provider';

type Params = {locale: Locale};

export async function generateStaticParams() {
  return locales.map(locale => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const {locale} = await params;
  const messages = await getMessages({locale});
  const safeLocale = locale ?? defaultLocale;

  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={safeLocale} messages={messages}>
        <div className="flex min-h-dvh flex-col">
          <Navbar locale={safeLocale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
