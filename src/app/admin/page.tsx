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
    .select('id, title, slug, status, locale, excerpt, cover_image_url, published_at, updated_at')
    .order('published_at', {ascending: false, nullsLast: true})
    .order('updated_at', {ascending: false, nullsLast: true});

  if (error) {
    return (
      <div className="container mx-auto p-8 text-neutral-900">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="mt-4 text-red-600">Erro ao carregar posts: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 text-neutral-900">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-neutral-500">
            Gerencie publicacoes e acesse ferramentas internas.
          </p>
        </div>
        <Link href="/admin/novo-post" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Novo anuncio
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(posts ?? []).map(post => {
          const safeSlug = post.slug && post.slug.trim().length > 0 ? post.slug : slugify(post.title ?? '');
          const locale = post.locale ?? 'pt';
          const isDraft = (post.status ?? '').toLowerCase() !== 'published';

          return (
            <div key={post.id} className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
              {resolveImageUrl(post.cover_image_url) ? (
                <Image
                  src={resolveImageUrl(post.cover_image_url)!}
                  alt={`Capa do post ${post.title}`}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-neutral-100 text-neutral-500">
                  Sem imagem
                </div>
              )}
              <div className="flex flex-grow flex-col p-4">
                <div className="mb-2 flex gap-2">
                  {post.status && (
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        isDraft ? 'bg-amber-100 text-amber-700' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  )}
                  {post.locale && (
                    <span className="rounded bg-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700">
                      {post.locale.toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="mb-2 flex-grow text-lg font-bold">{post.title}</h2>
                {post.excerpt && <p className="mb-4 text-sm text-neutral-600 whitespace-pre-line">{post.excerpt}</p>}
                <div className="mt-auto flex items-center justify-between border-t border-neutral-200 pt-4">
                  <div className="flex gap-4">
                    {isDraft ? (
                      <Link href={`/admin/editar/${safeSlug}`} className="text-indigo-600 hover:underline">
                        Continuar editando
                      </Link>
                    ) : (
                      <>
                        <LocaleLink
                          href={{pathname: '/blog/[slug]', params: {slug: safeSlug}}}
                          locale={locale}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                        >
                          Ver
                        </LocaleLink>
                        <Link href={`/admin/editar/${safeSlug}`} className="text-green-600 hover:underline">
                          Editar
                        </Link>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {isDraft
                      ? 'Rascunho'
                      : post.published_at
                      ? new Date(post.published_at).toLocaleDateString('pt-BR')
                      : 'Sem data'}
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
