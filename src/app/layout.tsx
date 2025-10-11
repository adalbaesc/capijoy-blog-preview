import '@/styles/globals.css';
import type {Metadata} from 'next';
import type {ReactNode} from 'react';

export const metadata: Metadata = {
  title: 'Capí Joy',
  description: 'Site multilíngue com Next.js 15',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  }
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="min-h-dvh bg-white text-neutral-900 antialiased transition-colors dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
