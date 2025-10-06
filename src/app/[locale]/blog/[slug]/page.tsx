import Image from 'next/image';
import {notFound} from 'next/navigation';
import ShareMenu from '@/components/site/ShareMenu';
import {supabase} from '@/lib/supabase';
import type {Locale} from '@/i18n/locales';

type Params = {locale: Locale; slug: string};
export const runtime = 'nodejs';
export const revalidate = 0;

type Post = {
  id: string;
  title: string;
  content_html: string | null;
  cover_image_url: string | null;
  published_at: string;
  locale: Locale;
};

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', {
    dateStyle: 'long'
  }).format(new Date(date));
}

export default async function PostPage({params}: {params: Promise<Params>}) {
  const {locale, slug} = await params;

  const {data, error} = await supabase
    .from('posts')
    .select('id, title, content_html, cover_image_url, published_at, status, locale')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const post = data as Post;
  const sharePath = `/${locale}/blog/${slug}`;

  return (
    <article className="prose mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
      <div className="mb-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="mb-0">{post.title}</h1>
          <ShareMenu url={sharePath} title={post.title} />
        </div>
        <time className="block text-sm text-neutral-500">
          {formatDate(post.published_at, locale)}
        </time>
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
  );
}


