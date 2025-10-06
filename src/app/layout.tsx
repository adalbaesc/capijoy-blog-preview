import '@/styles/globals.css';
import type {ReactNode} from 'react';

export const metadata = {
  title: 'Capí Joy',
  description: 'Site multilíngue com Next.js 15'
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
