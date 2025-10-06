'use client';

import {Link, usePathname} from '@/i18n/routing';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import {ThemeToggle} from '@/components/ui/ThemeToggle';

export default function Header() {
  const pathname = usePathname();
  const isBlog = pathname?.includes('/blog');
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/60 bg-neutral-950/60 text-neutral-100">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-semibold">
          Capi Joy
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {!isBlog && (
            <>
              <a href="#inicio" className="nav-link">
                Início
              </a>
              <a href="#sobre" className="nav-link">
                Sobre
              </a>
              <a href="#musica" className="nav-link">
                Música
              </a>
              <a href="#pilares" className="nav-link">
                Conferências
              </a>
              <a href="#blog" className="nav-link">
                Blog
              </a>
              <a href="#contato" className="nav-link">
                Contato
              </a>
            </>
          )}
          {isBlog && <Link href="/">Voltar à Home</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
