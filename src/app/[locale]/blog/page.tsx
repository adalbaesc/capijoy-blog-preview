import Image from 'next/image';
import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';

import ShareMenu from '@/components/site/ShareMenu';
import {supabase} from '@/lib/supabase';
import {absoluteUrl} from '@/lib/urls';

import type {Locale} from '@/i18n/locales';

type Params = {locale: Locale};

export const runtime = 'nodejs';
export const revalidate = 0;

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  published_at: string;
  cover_image_url: string | null;
  locale: Locale;
};

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', {
    dateStyle: 'long'
  }).format(new Date(date));
}

export async function generateMetadata({params}: {params: Promise<Params>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'blog'});
  const title = t('meta.title');
  const description = t('meta.description');
  const canonicalPath = `/${locale}/blog`;
  const canonicalUrl = absoluteUrl(canonicalPath);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Capijoy',
      locale
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function BlogIndex({params}: {params: Promise<Params>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'blog'});

  const {data, error} = await supabase
    .from('posts')
    .select('id, title, excerpt, slug, cover_image_url, published_at, status, locale')
    .eq('locale', locale)
    .eq('status', 'published')
    .order('published_at', {ascending: false})
    .limit(12);

  if (error) {
    return (
      <p className="container mx-auto px-4 py-10 text-red-600">
        {t('list.error', {message: error.message})}
      </p>
    );
  }

  const posts = (data ?? []) as Post[];

  if (!posts.length) {
    return (
      <p className="container mx-auto px-4 py-10 text-sm opacity-80">
        {t('list.empty')}
      </p>
    );
  }

  return (
    <div className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-3">
      {posts.map(post => (
        <article key={post.id} className="section-card rounded-2xl shadow">
          {post.cover_image_url ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="grid h-40 place-items-center rounded-t-2xl bg-neutral-200/60 text-xs uppercase tracking-wide text-neutral-600 transition-colors dark:bg-black/40 dark:text-neutral-400">
              {t('list.coverUnavailable')}
            </div>
          )}

          <div className="space-y-3 p-4">
            <time className="block text-xs uppercase tracking-wide text-neutral-500">
              {formatDate(post.published_at, locale)}
            </time>
            <h2 className="line-clamp-2 text-lg font-semibold">{post.title}</h2>
            {post.excerpt && (
              <p className="text-sm text-neutral-600 whitespace-pre-line dark:text-neutral-300">{post.excerpt}</p>
            )}
            <div className="flex items-center justify-between gap-3 pt-1">
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="text-sm font-medium text-white underline underline-offset-4"
              >
                {t('list.readPost')}
              </Link>
              <ShareMenu url={`/${locale}/blog/${post.slug}`} title={post.title} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
