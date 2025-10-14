import {NextIntlClientProvider} from 'next-intl';
import type {ReactNode} from 'react';

export default function AdminLayout({children}: {children: ReactNode}) {
  return (
    <NextIntlClientProvider locale="pt">
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
