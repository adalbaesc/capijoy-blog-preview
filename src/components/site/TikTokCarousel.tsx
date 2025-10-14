"use client";

import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {useEffect, useMemo, useRef, useState} from 'react';

export type TikTokVideo = {
  url: string;
  title?: string;
  lang?: string;
  cover?: string;
};

export type TikTokCarouselProps = {
  videos: ReadonlyArray<TikTokVideo>;
};

function extractVideoId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/i);
  return match?.[1] ?? null;
}

export default function TikTokCarousel({videos}: TikTokCarouselProps) {
  const t = useTranslations('tiktok');
  const containerRef = useRef<HTMLDivElement>(null);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const videoKey = useMemo(() => videos.map(video => `${video.url}|${video.cover ?? ''}`).join(','), [videos]);

  const updateScrollState = () => {
    const container = containerRef.current;
    if (!container) return;
    const {scrollLeft, clientWidth, scrollWidth} = container;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  };

  useEffect(() => {
    const entries = videos
      .map(video => {
        const id = extractVideoId(video.url);
        if (!id) {
          return null;
        }
        return {...video, id};
      })
      .filter(Boolean) as Array<TikTokVideo & {id: string}>;

    if (!entries.length) {
      setCovers({});
      return;
    }

    const initial: Record<string, string> = {};
    const pending: Array<{id: string; url: string; lang?: string}> = [];

    entries.forEach(entry => {
      if (entry.cover) {
        initial[entry.id] = entry.cover;
      } else {
        pending.push({id: entry.id, url: entry.url, lang: entry.lang});
      }
    });

    setCovers(prev => ({...initial, ...prev}));

    if (!pending.length) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    (async () => {
      const results = await Promise.all(
        pending.map(async item => {
          try {
            const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(item.url)}`;
            const response = await fetch(oembedUrl, {signal: controller.signal});
            if (!response.ok) {
              return null;
            }
            const data = (await response.json()) as {thumbnail_url?: string | null};
            const thumbnail = typeof data?.thumbnail_url === 'string' ? data.thumbnail_url : null;
            return thumbnail ? [item.id, thumbnail] : null;
          } catch {
            return null;
          }
        })
      );

      if (!isMounted) {
        return;
      }

      setCovers(prev => {
        const next = {...prev};
        for (const result of results) {
          if (!result) continue;
          const [id, url] = result;
          next[id] = url;
        }
        return next;
      });
    })();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [videoKey, videos]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollState();

    const handleScroll = () => updateScrollState();
    container.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [videos.length]);

  if (!videos.length) {
    return null;
  }

  const scrollByDirection = (direction: 'prev' | 'next') => {
    const container = containerRef.current;
    if (!container) return;

    const distance = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth'
    });

    window.setTimeout(updateScrollState, 350);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => scrollByDirection('prev')}
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:pointer-events-none disabled:opacity-30 md:flex"
          aria-label={t('prev')}
          disabled={!canScrollLeft}
        >
          <span aria-hidden="true">&#8249;</span>
        </button>
        <div
          ref={containerRef}
          className="flex snap-x gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
        >
          {videos.map(video => {
            const videoId = extractVideoId(video.url);
            if (!videoId) {
              return null;
            }
            const cover = video.cover ?? covers[videoId];
            const title = video.title ?? `TikTok video ${videoId}`;
            const ariaLabel = t('watchAria', {title});

            return (
              <article key={videoId} className="snap-center">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-[260px] flex-col gap-3 sm:w-[300px]"
                  aria-label={ariaLabel}
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black/40">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={title}
                        fill
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 260px, 300px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/10 text-sm text-white/60">
                        {t('coverUnavailable')}
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/10">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-2xl text-white shadow-lg">
                        &#9654;
                      </span>
                    </div>
                  </div>
                  <span className="text-center text-sm font-medium text-amber-400 underline-offset-4 transition group-hover:text-amber-300 group-hover:underline">
                    {t('watchOn')}
                  </span>
                </a>
              </article>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollByDirection('next')}
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:pointer-events-none disabled:opacity-30 md:flex"
          aria-label={t('next')}
          disabled={!canScrollRight}
        >
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
    </div>
  );
}

