import Image from 'next/image';
import Link from 'next/link';
import {FaWhatsapp} from 'react-icons/fa';
import {getTranslations} from 'next-intl/server';

import TikTokCarousel, {type TikTokVideo} from '@/components/site/TikTokCarousel';
import HomePosts from '@/components/site/HomePosts';
import type {Locale} from '@/i18n/locales';

type Params = {locale: Locale};

const MUSIC_CARD_KEYS = ['card1', 'card2', 'card3'] as const;

const MUSIC_CARD_META: Record<(typeof MUSIC_CARD_KEYS)[number], {href: string; image: string}> = {
  card1: {
    href: 'https://www.youtube.com/watch?v=6EVY-Ef8GRY',
    image: '/assets/capa_basta.webp'
  },
  card2: {
    href: 'https://open.spotify.com/intl-pt/artist/6l2XVPCSpXi3oKheB3UvKI',
    image: '/assets/capi-joy-spotify.webp'
  },
  card3: {
    href: 'https://music.apple.com/br/artist/cap%C3%AD-joy/1831439555',
    image: '/assets/capi-joy-apple-music.webp'
  }
};

const CONFERENCE_TOPIC_KEYS = ['topic1', 'topic2'] as const;

const TIKTOK_VIDEO_SOURCES = [
  {
    url: 'https://www.tiktok.com/@capijoyoficial/video/7554336621676563723',
    lang: 'pt-BR',
    fallbackKey: 'basta'
  },
  {
    url: 'https://www.tiktok.com/@capijoyoficial/video/7548814698758540549',
    lang: 'pt-BR',
    fallbackKey: 'spotify'
  },
  {
    url: 'https://www.tiktok.com/@capijoyoficial/video/7546906338732068152',
    lang: 'pt-BR',
    fallbackKey: 'inspire'
  },
  {
    url: 'https://www.tiktok.com/@capijoyoficial/video/7161962857809054982',
    lang: 'pt-BR',
    fallbackKey: 'hope'
  }
] as const;

type TikTokFallbackKey = (typeof TIKTOK_VIDEO_SOURCES)[number]['fallbackKey'];

interface TikTokOEmbedResponse {
  title?: string;
  thumbnail_url?: string;
}

async function getTikTokVideos(fallbacks: Record<TikTokFallbackKey, string>): Promise<TikTokVideo[]> {
  try {
    const results = await Promise.all(
      TIKTOK_VIDEO_SOURCES.map(async source => {
        const fallbackTitle = fallbacks[source.fallbackKey] ?? source.fallbackKey;
        try {
          const response = await fetch(
            `https://www.tiktok.com/oembed?url=${encodeURIComponent(source.url)}`,
            {next: {revalidate: 3600}}
          );

          if (!response.ok) {
            return {url: source.url, lang: source.lang, title: fallbackTitle};
          }

          const data = (await response.json()) as TikTokOEmbedResponse;

          return {
            url: source.url,
            lang: source.lang,
            title: typeof data.title === 'string' ? data.title : fallbackTitle,
            cover: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : undefined
          };
        } catch {
          return {url: source.url, lang: source.lang, title: fallbackTitle};
        }
      })
    );

    return results;
  } catch {
    return TIKTOK_VIDEO_SOURCES.map(source => ({
      url: source.url,
      lang: source.lang,
      title: fallbacks[source.fallbackKey] ?? source.fallbackKey
    }));
  }
}

export default async function Page({params}: {params: Promise<Params>}) {
  const {locale} = await params;
  const homeT = await getTranslations({locale, namespace: 'home'});
  const tiktokT = await getTranslations({locale, namespace: 'tiktok'});

  const heroLines = [0, 1, 2].map(index => homeT(`hero.lines.${index}`));
  const aboutParagraphs = [0, 1, 2].map(index => homeT(`about.paragraphs.${index}`));
  const musicCards = MUSIC_CARD_KEYS.map(key => ({
    ...MUSIC_CARD_META[key],
    title: homeT(`music.cards.${key}.title`),
    description: homeT(`music.cards.${key}.description`),
    cta: homeT(`music.cards.${key}.cta`),
    alt: homeT(`music.cards.${key}.alt`)
  }));
  const conferenceTopics = CONFERENCE_TOPIC_KEYS.map(key => homeT(`conferences.topics.${key}`));
  const fallbackTitles: Record<TikTokFallbackKey, string> = {
    basta: tiktokT('fallback.basta'),
    spotify: tiktokT('fallback.spotify'),
    inspire: tiktokT('fallback.inspire'),
    hope: tiktokT('fallback.hope')
  };
  const tiktokVideos = await getTikTokVideos(fallbackTitles);

  return (
    <>
      <section id="topo" className="relative isolate">
        <div className="relative aspect-[5/7] w-full max-h-[85vh] sm:aspect-[16/9] sm:max-h-[70vh]">
          <Image
            src="/assets/banner-capi-joy.webp"
            alt={homeT('hero.bannerAlt')}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 section-overlay" />
        </div>
        <div className="absolute inset-0">
          <div className="flex h-full items-start sm:items-center">
            <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-20 sm:px-6 sm:pb-0 sm:pt-0">
              <div className="max-w-3xl space-y-5 transition-colors">
                <h1 className="text-3xl font-extrabold text-[var(--page-text)] sm:text-5xl">
                  {heroLines.map(line => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="text-base text-muted">{homeT('hero.description')}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="#contato" className="surface-button rounded-full px-4 py-2 text-sm">
                    {homeT('hero.ctaPrimary')}
                  </Link>
                  <p className="text-sm text-muted">{homeT('hero.ctaSupport')}</p>
                  <Link
                    href="https://www.youtube.com/watch?v=6EVY-Ef8GRY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-button rounded-full px-4 py-2 text-sm"
                    title={homeT('hero.ctaVideo')}
                  >
                    {homeT('hero.ctaVideo')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="relative w-full overflow-hidden px-4 py-16">
        <div className="pointer-events-none absolute inset-0 -z-20">
          <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-neutral-50/90 via-white/40 to-amber-50/40 transition-colors duration-500 dark:from-neutral-950/90 dark:via-neutral-950/55 dark:to-neutral-900/75" />
          <div className="absolute inset-0 h-full w-full animate-aurora-spin bg-[conic-gradient(at_center,_rgba(255,213,0,0.26),_rgba(236,72,153,0.18),_rgba(56,189,248,0.2),_rgba(255,213,0,0.26))] blur-3xl opacity-70 dark:opacity-60" />
          <div className="absolute inset-0 h-full w-full bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22 viewBox=%220 0 240 240%22%3E%3Cstyle%3Etext%7Bfill:%23ffffff;font-family:%27Segoe UI Symbol%27,%27Noto Sans Symbols%27,sans-serif;font-weight:600;%7D%3C/style%3E%3Ctext x=%2220%22 y=%2260%22 font-size=%2236%22%3E%E2%99%AA%3C/text%3E%3Ctext x=%22150%22 y=%2290%22 font-size=%2228%22%3E%E2%99%AB%3C/text%3E%3Ctext x=%2280%22 y=%22150%22 font-size=%2234%22%3E%E2%99%AC%3C/text%3E%3Ctext x=%22170%22 y=%22200%22 font-size=%2230%22%3E%E2%99%A9%3C/text%3E%3C/svg%3E')] bg-repeat bg-[length:180px_180px] opacity-[0.08] dark:opacity-10" />
        </div>
        <div className="section-card relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[360px] overflow-hidden rounded-3xl bg-transparent p-3 sm:max-w-[380px] sm:p-4 lg:max-w-[420px]">
            <Image
              src="/assets/retrato-capi-joy.webp"
              alt={homeT('about.imageAlt')}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div className="space-y-6 text-base leading-relaxed text-[var(--page-text)]">
            <h2 className="text-3xl font-semibold text-[var(--page-text)]">{homeT('about.title')}</h2>
            {aboutParagraphs.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="musicas" className="relative w-full overflow-hidden px-4 py-10">
        <div
          className="absolute inset-0 -z-20 h-full w-full bg-fixed bg-cover bg-center bg-no-repeat object-cover transition-all duration-500"
          style={{backgroundImage: "url('/assets/background-music.webp')"}}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 h-full w-full music-section-overlay" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl space-y-6 text-[var(--page-text)] transition-colors duration-500">
          <h2 className="text-3xl font-semibold text-[var(--page-text)]">{homeT('music.title')}</h2>
          <p className="max-w-2xl text-sm text-muted">{homeT('music.description')}</p>
          <div className="overflow-hidden rounded-3xl">
            <iframe
              width="100%"
              height="360"
              src="https://www.youtube-nocookie.com/embed/6EVY-Ef8GRY"
              title={homeT('music.videoTitle')}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {musicCards.map(card => (
              <article key={card.title} className="section-card space-y-3 rounded-3xl p-6">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                  <Image src={card.image} alt={card.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 30vw" />
                </div>
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="text-sm text-muted">{card.description}</p>
                <Link href={card.href} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="conferencias" className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10">
        <h2 className="text-3xl font-semibold">{homeT('conferences.title')}</h2>
        <p className="max-w-3xl text-sm">{homeT('conferences.lead')}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {conferenceTopics.map(topic => (
            <div key={topic} className="section-card rounded-2xl px-4 py-3 text-sm leading-relaxed">
              {topic}
            </div>
          ))}
        </div>
      </section>

      <section id="blog" className="mx-auto w-full max-w-7xl space-y-4 px-4 py-10">
        <h2 className="text-3xl font-semibold">{homeT('blog.title')}</h2>
        <p className="text-sm">{homeT('blog.description')}</p>
        <HomePosts locale={locale} />
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-4 px-4 py-10">
        <h2 className="text-3xl font-semibold">{homeT('social.title')}</h2>
        <TikTokCarousel videos={tiktokVideos} />
      </section>

      <section id="contato" className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="section-card flex flex-col items-center gap-6 rounded-3xl p-8 text-center">
          <h3 className="text-lg font-semibold">{homeT('contact.title')}</h3>
          <p className="text-sm text-muted">{homeT('contact.description')}</p>
          <form
            action="mailto:contato@capijoy.com.br"
            method="POST"
            encType="text/plain"
            className="flex w-full max-w-xl flex-col gap-3 text-left font-sans"
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-[var(--page-text)]">{homeT('contact.form.nameLabel')}</span>
              <input
                type="text"
                name="name"
                required
                placeholder={homeT('contact.form.namePlaceholder')}
                className="input-surface w-full rounded-lg px-4 py-2 text-sm font-sans placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-[var(--page-text)]">{homeT('contact.form.emailLabel')}</span>
              <input
                type="email"
                name="email"
                required
                placeholder={homeT('contact.form.emailPlaceholder')}
                className="input-surface w-full rounded-lg px-4 py-2 text-sm font-sans placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-[var(--page-text)]">{homeT('contact.form.messageLabel')}</span>
              <textarea
                name="message"
                required
                rows={4}
                placeholder={homeT('contact.form.messagePlaceholder')}
                className="input-surface w-full rounded-xl px-4 py-3 text-sm font-sans placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
              />
            </label>
            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-sans font-semibold text-neutral-900 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-neutral-950"
            >
              {homeT('contact.form.submit')}
            </button>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="font-medium">{homeT('contact.phoneLabel')}:</span>
            <Link href="tel:+5537999091340" className="underline">
              +55 (37) 99876-5452
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="font-medium">{homeT('contact.emailLabel')}:</span>
            <Link href="mailto:contato@capijoy.com.br" className="underline">
              contato@capijoy.com.br
            </Link>
          </div>
          <Link
            href="https://api.whatsapp.com/send?phone=5537999091340"
            target="_blank"
            rel="noopener noreferrer"
            className="surface-button inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            <FaWhatsapp className="text-lg" aria-hidden="true" />
            <span>{homeT('contact.whatsCta')}</span>
          </Link>
        </div>
      </section>
    </>
  );
}
