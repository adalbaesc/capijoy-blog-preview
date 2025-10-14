"use client";

import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {LuCheck, LuCopy, LuShare2} from 'react-icons/lu';
import {FaWhatsapp, FaFacebookF, FaLinkedinIn} from 'react-icons/fa';
import {FaXTwitter} from 'react-icons/fa6';

type ShareMenuProps = {
  url: string;
  title: string;
  className?: string;
};

function normalizeUrl(path: string, origin?: string) {
  if (!path) {
    return "";
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://capijoy.com.br";
  const sanitizedBase = base.replace(/\/$/, "");
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${sanitizedBase}${sanitizedPath}`;
}

export default function ShareMenu({url, title, className}: ShareMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clientOrigin, setClientOrigin] = useState<string | undefined>();
  const t = useTranslations('shareMenu');

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientOrigin(window.location.origin);
    }
  }, []);

  const shareUrl = useMemo(() => normalizeUrl(url, clientOrigin), [url, clientOrigin]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current || containerRef.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keyup", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keyup", handleEsc);
    };
  }, [isOpen]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (copied) {
      timeout = setTimeout(() => setCopied(false), 2000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [copied]);

  const handleToggle = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({title, url: shareUrl});
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        // fall through to open menu
      }
    }
    setIsOpen(prev => !prev);
  };

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      // ignore clipboard errors
    }
  };

  const shareOptions = [
    {
      label: t('options.whatsapp'),
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
      icon: FaWhatsapp
    },
    {
      label: t('options.facebook'),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: FaFacebookF
    },
    {
      label: t('options.x'),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
      icon: FaXTwitter
    },
    {
      label: t('options.linkedin'),
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
      icon: FaLinkedinIn
    }
  ];

  const containerClasses = ["relative inline-flex", className].filter(Boolean).join(" ");

  return (
    <div className={containerClasses} ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-neutral-900 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-neutral-900"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('buttonAria')}
      >
        <LuShare2 className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-white/10 bg-neutral-950/95 p-2 text-sm shadow-xl backdrop-blur">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-white/60">{t('title')}</p>
          <div className="space-y-1">
            {shareOptions.map(option => (
              <a
                key={option.label}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-white transition hover:bg-white/10"
              >
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </a>
            ))}
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-white transition hover:bg-white/10"
            >
              {copied ? <LuCheck className="h-4 w-4" /> : <LuCopy className="h-4 w-4" />}
              <span>{copied ? t('copied') : t('copy')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}