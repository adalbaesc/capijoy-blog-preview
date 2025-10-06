import {createServerClient} from '@/lib/supabaseServer';
import {resolveImageUrl} from '@/lib/storage';
import {slugify} from '@/lib/slugify';
import Link from 'next/link';
import Image from 'next/image';
import {Link as LocaleLink} from '@/i18n/routing';

export default async function AdminPage() {
  const supabase = await createServerClient();

  const {data: posts, error} = await supabase
    .from('posts')
    .select('id, title, slug, status, locale, excerpt, cover_image_url, published_at')
    .order('published_at', {ascending: false});

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-red-500 mt-4">Erro ao carregar posts: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-neutral-400">Gerencie publicações e acesse ferramentas internas.</p>
        </div>
        <Link href="/admin/novo-post" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Novo Anúncio
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(posts ?? []).map(post => {
          const safeSlug = post.slug && post.slug.trim().length > 0 ? post.slug : slugify(post.title ?? '');
          const locale = post.locale ?? 'pt';

          return (
            <div key={post.id} className="bg-neutral-800 rounded-lg overflow-hidden shadow-lg flex flex-col">
              {resolveImageUrl(post.cover_image_url) ? (
                <Image
                  src={resolveImageUrl(post.cover_image_url)!}
                  alt={`Capa do post ${post.title}`}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-neutral-700 flex items-center justify-center text-neutral-500">
                  Sem imagem
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex gap-2 mb-2">
                  {post.status && (
                    <span className="text-xs font-semibold bg-neutral-700 px-2 py-1 rounded">
                      {post.status.toUpperCase()}
                    </span>
                  )}
                  {post.locale && (
                    <span className="text-xs font-semibold bg-neutral-700 px-2 py-1 rounded">
                      {post.locale.toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="font-bold text-lg mb-2 flex-grow">{post.title}</h2>
                {post.excerpt && <p className="text-sm text-neutral-400 mb-4 line-clamp-3">{post.excerpt}</p>}
                <div className="mt-auto pt-4 border-t border-neutral-700 flex justify-between items-center">
                  <div className="flex gap-4">
                    <LocaleLink
                      href={{pathname: '/blog/[slug]', params: {slug: safeSlug}}}
                      locale={locale}
                      className="text-blue-400 hover:underline"
                      target="_blank"
                    >
                      Ver
                    </LocaleLink>
                    <Link href={`/admin/editar/${safeSlug}`} className="text-green-400 hover:underline">
                      Editar
                    </Link>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : 'Sem data'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
