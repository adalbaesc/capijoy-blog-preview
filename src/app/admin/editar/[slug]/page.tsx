import Link from 'next/link';
import {notFound} from 'next/navigation';
import {createServerClient} from '@/lib/supabaseServer';
import EditPostForm from '../EditPostForm';

type AdminLocale = 'pt' | 'en' | 'es';

const AVAILABLE_LOCALES: AdminLocale[] = ['pt', 'en', 'es'];
const LOCALE_LABEL: Record<AdminLocale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español'
};

function isAdminLocale(value: unknown): value is AdminLocale {
  return typeof value === 'string' && AVAILABLE_LOCALES.includes(value as AdminLocale);
}

export default async function EditPostPage({
  params,
  searchParams
}: {
  params: Promise<{slug: string}>;
  searchParams: Promise<{locale?: string | string[]}>;
}) {
  const {slug} = await params;
  const incomingSearch = (await searchParams) ?? {};
  const localeParam = incomingSearch.locale;
  const requestedLocale = Array.isArray(localeParam) ? localeParam[0] : localeParam;

  const supabase = await createServerClient();
  const {data: posts, error} = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug);

  if (error) {
    console.error('Erro ao carregar post:', error.message);
    return notFound();
  }

  if (!posts || posts.length === 0) {
    return notFound();
  }

  const postsByLocale = new Map<AdminLocale, (typeof posts)[number]>();
  posts.forEach(currentPost => {
    if (isAdminLocale(currentPost.locale)) {
      postsByLocale.set(currentPost.locale, currentPost);
    }
  });

  const fallbackLocale: AdminLocale =
    (postsByLocale.has('pt')
      ? 'pt'
      : isAdminLocale(posts[0]?.locale)
      ? (posts[0]?.locale as AdminLocale)
      : 'pt');

  const resolvedLocale: AdminLocale =
    (requestedLocale && AVAILABLE_LOCALES.includes(requestedLocale as AdminLocale) && postsByLocale.has(requestedLocale)
      ? (requestedLocale as AdminLocale)
      : fallbackLocale) ?? 'pt';

  const post = postsByLocale.get(resolvedLocale);

  if (!post) {
    return notFound();
  }

  const missingRequestedLocale =
    Boolean(requestedLocale) &&
    (!AVAILABLE_LOCALES.includes(requestedLocale as AdminLocale) || !postsByLocale.has(requestedLocale));
  const requestedLocaleLabel =
    requestedLocale && isAdminLocale(requestedLocale) ? LOCALE_LABEL[requestedLocale] : requestedLocale?.toUpperCase();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">
          Editar Post: <span className="block text-xl font-semibold text-neutral-500 sm:inline sm:text-3xl sm:font-bold sm:text-neutral-900">{post.title}</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_LOCALES.map(locale => {
            const isActive = locale === resolvedLocale;
            const existForLocale = postsByLocale.has(locale);
            const baseClasses =
              'rounded-full border px-3 py-1 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500';
            const stateClasses = isActive
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100';
            const disabledClasses = existForLocale ? '' : 'pointer-events-none opacity-40';

            return existForLocale ? (
              <Link
                key={locale}
                href={`/admin/editar/${slug}?locale=${locale}`}
                className={`${baseClasses} ${stateClasses} ${disabledClasses}`}
              >
                {LOCALE_LABEL[locale]}
              </Link>
            ) : (
              <span key={locale} className={`${baseClasses} ${stateClasses} ${disabledClasses}`}>
                {LOCALE_LABEL[locale]}
              </span>
            );
          })}
        </div>
        {missingRequestedLocale && requestedLocale && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Tradução para {requestedLocaleLabel ?? requestedLocale.toUpperCase()} ainda não disponível para este post.
          </div>
        )}
      </div>
      <EditPostForm key={post.id} post={post} />
    </div>
  );
}
