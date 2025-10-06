import Image from 'next/image';
import Link from 'next/link';
import ShareMenu from '@/components/site/ShareMenu';
import {supabase} from '@/lib/supabase';
import type {Locale} from '@/i18n/locales';

type Params = {locale: Locale};
export const runtime = 'nodejs';
export const revalidate = 0;

type Post = {
  id: string;
  title: string;
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

export default async function BlogIndex({params}: {params: Promise<Params>}) {
  const {locale} = await params;

  const {data, error} = await supabase
    .from('posts')
    .select('id, title, slug, cover_image_url, published_at, status, locale')
    .eq('locale', locale)
    .eq('status', 'published')
    .order('published_at', {ascending: false})
    .limit(12);

  if (error) {
    return <p className="container mx-auto px-4 py-10 text-red-600">Erro: {error.message}</p>;
  }

  const posts = (data ?? []) as Post[];

  if (!posts.length) {
    return <p className="container mx-auto px-4 py-10">Nenhuma postagem publicada ainda.</p>;
  }

  return (
    <div className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-3">
      {posts.map(post => (
        <article key={post.id} className="relative rounded-2xl bg-white/5 shadow">
          <ShareMenu url={`/${locale}/blog/${post.slug}`} title={post.title} className="absolute right-3 top-3 z-10" />
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
            <div className="grid h-40 place-items-center rounded-t-2xl bg-black/40 text-xs uppercase tracking-wide text-neutral-500">
              Capa indisponível
            </div>
          )}
          <div className="space-y-3 p-4">
            <time className="block text-xs uppercase tracking-wide text-neutral-500">
              {formatDate(post.published_at, locale)}
            </time>
            <h2 className="line-clamp-2 text-lg font-semibold">{post.title}</h2>
            <Link href={`/${locale}/blog/${post.slug}`} className="text-sm underline">
              Ler post →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}


