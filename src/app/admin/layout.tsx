import {NextIntlClientProvider} from 'next-intl';
import type {ReactNode} from 'react';

export default function AdminLayout({children}: {children: ReactNode}) {
  return <NextIntlClientProvider locale="pt">{children}</NextIntlClientProvider>;
}
