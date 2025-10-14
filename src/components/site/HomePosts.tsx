import Image from "next/image";
import Link from "next/link";
import {getTranslations} from "next-intl/server";

import ShareMenu from "@/components/site/ShareMenu";
import {supabase} from "@/lib/supabase";
import type {Locale} from "@/i18n/locales";

export const runtime = "nodejs";
export const revalidate = 0;

type HomePostsProps = {
  locale: Locale;
};

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
  return new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR",
    {dateStyle: "long"}
  ).format(new Date(date));
}

export default async function HomePosts({locale}: HomePostsProps) {
  const t = await getTranslations({locale, namespace: "homePosts"});

  const {data, error} = await supabase
    .from("posts")
    .select("id, title, excerpt, slug, cover_image_url, published_at, status, locale")
    .eq("locale", locale)
    .eq("status", "published")
    .order("published_at", {ascending: false})
    .limit(3);

  if (error) {
    return <p className="text-sm text-red-600">{t("error", {message: error.message})}</p>;
  }

  const posts = (data ?? []) as Post[];

  if (!posts.length) {
    return <p className="text-sm opacity-80">{t("empty")}</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {posts.map(post => (
        <article key={post.id} className="section-card relative rounded-2xl shadow">
          {post.cover_image_url ? (
            <div className="relative aspect-[16/9] w-full">
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
              {t("coverUnavailable")}
            </div>
          )}
          <div className="space-y-3 p-4">
            <time className="block text-xs uppercase tracking-wide text-neutral-500">
              {formatDate(post.published_at, locale)}
            </time>
            <h4 className="line-clamp-2 font-semibold">{post.title}</h4>
            {post.excerpt && (
              <p className="text-sm text-neutral-600 whitespace-pre-line dark:text-neutral-300">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between gap-3 pt-1">
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="text-sm font-medium text-white underline underline-offset-4"
              >
                {t("readPost")}
              </Link>
              <ShareMenu url={`/${locale}/blog/${post.slug}`} title={post.title} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
