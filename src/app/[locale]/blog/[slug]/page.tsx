import Image from 'next/image';
import Script from 'next/script';
import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import ShareMenu from '@/components/site/ShareMenu';
import {supabase} from '@/lib/supabase';
import type {Locale} from '@/i18n/locales';
import {absoluteUrl} from '@/lib/urls';

type Params = {locale: Locale; slug: string};
export const runtime = 'nodejs';
export const revalidate = 0;

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  content_html: string | null;
  cover_image_url: string | null;
  published_at: string;
  updated_at: string | null;
  status: string | null;
  locale: Locale;
};

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', {
    dateStyle: 'long'
  }).format(new Date(date));
}

async function fetchPublishedPost(locale: Locale, slug: string): Promise<Post | null> {
  const {data, error} = await supabase
    .from('posts')
    .select('id, title, excerpt, content_html, cover_image_url, published_at, updated_at, status, locale')
    .eq('slug', slug)
    .eq('locale', locale)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const post = data as Post;
  if (post.status !== 'published') {
    return null;
  }

  return post;
}

export async function generateMetadata({params}: {params: Promise<Params>}): Promise<Metadata> {
  const {locale, slug} = await params;
  const t = await getTranslations({locale, namespace: 'blogPost'});
  const post = await fetchPublishedPost(locale, slug);
  const blogPath = `/${locale}/blog`;

  if (!post) {
    const blogUrl = absoluteUrl(blogPath);
    const title = t('notAvailableTitle');
    const description = t('notAvailableDescription');

    return {
      title,
      description,
      alternates: {
        canonical: blogUrl
      },
      robots: {
        index: false,
        follow: false
      },
      openGraph: {
        title,
        description,
        type: 'website',
        url: blogUrl,
        siteName: 'Capijoy'
      },
      twitter: {
        card: 'summary',
        title,
        description
      }
    };
  }

  const canonicalPath = `/${locale}/blog/${slug}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const description =
    post.excerpt ?? t('fallbackDescription', {title: post.title});
  const imageUrl = post.cover_image_url ? absoluteUrl(post.cover_image_url) : undefined;
  const siteName = 'Capijoy';

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: post.title,
      description,
      siteName,
      locale,
      images: imageUrl ? [{url: imageUrl}] : undefined,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at ?? post.published_at
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : undefined
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function PostPage({params}: {params: Promise<Params>}) {
  const {locale, slug} = await params;
  const post = await fetchPublishedPost(locale, slug);
  const t = await getTranslations({locale, namespace: 'blogPost'});

  if (!post) {
    redirect(`/${locale}/blog`);
  }

  const sharePath = `/${locale}/blog/${slug}`;
  const canonicalUrl = absoluteUrl(sharePath);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description:
      post.excerpt ?? t('fallbackDescription', {title: post.title}),
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    mainEntityOfPage: canonicalUrl,
    image: post.cover_image_url ? absoluteUrl(post.cover_image_url) : undefined,
    inLanguage: locale,
    author: {
      '@type': 'Organization',
      name: 'Capijoy'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Capijoy'
    }
  };

  return (
    <>
      <Script id={`post-jsonld-${post.id}`} type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <article className="prose mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
        <div className="mb-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="mb-0">{post.title}</h1>
            <ShareMenu url={sharePath} title={post.title} />
          </div>
          <time className="block text-sm text-neutral-500">{formatDate(post.published_at, locale)}</time>
        </div>
        {post.cover_image_url && (
          <div className="relative mb-6 aspect-[16/9] w-full">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="rounded-xl object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}
        <div dangerouslySetInnerHTML={{__html: post.content_html ?? ''}} />
      </article>
    </>
  );
}
