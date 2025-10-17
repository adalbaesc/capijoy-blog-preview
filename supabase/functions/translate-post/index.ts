/// <reference path="../types.d.ts" />
import type { Handler } from "https://deno.land/std@0.168.0/http/server.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.4";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const translate = async (text: string, lang: string): Promise<string> => {
  if (!text) return "";
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      target: lang,
      source: "pt",
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to translate text: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  const json = await response.json();
  return json.data.translations[0].translatedText;
};

const handler: Handler = async (req) => {
  const payload = await req.json() as { record?: Record<string, unknown> };
  const post = payload.record as {
    locale?: string;
    title?: string;
    excerpt?: string;
    content_html?: string;
    [key: string]: unknown;
  };

  if (!post) {
    return new Response(JSON.stringify({ message: 'Missing post data' }), { status: 400 });
  }

  if (post.locale !== 'pt') {
    return new Response(JSON.stringify({ message: 'Post is not in Portuguese, skipping translation' }), { status: 200 });
  }

  if (!post.slug || typeof post.slug !== 'string') {
    return new Response(JSON.stringify({ message: 'Post slug is required for translation' }), { status: 400 });
  }

  const targetLanguages = ['en', 'es'];
  const baseStatus = typeof post.status === 'string' && post.status.toLowerCase() === 'published' ? 'published' : 'draft';
  const basePublishedAt =
    typeof post.published_at === 'string' && post.published_at ? post.published_at : null;
  const timestampNow = new Date().toISOString();

  try {
    for (const lang of targetLanguages) {
      // Add a delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));

      const [translatedTitle, translatedExcerpt, translatedContent] = await Promise.all([
        translate(post.title ?? '', lang),
        translate(post.excerpt ?? '', lang),
        translate(post.content_html ?? '', lang)
      ]);

      const normalizedExcerpt = translatedExcerpt ? translatedExcerpt : null;
      const normalizedStatus = baseStatus === 'published' ? 'published' : 'draft';
      const normalizedPublishedAt = normalizedStatus === 'published' ? (basePublishedAt ?? timestampNow) : null;
      const coverImageInput = post.cover_image_url as string | null | undefined;
      let normalizedCoverImage: string | null | undefined;

      if (coverImageInput === undefined) {
        normalizedCoverImage = undefined;
      } else if (coverImageInput === null) {
        normalizedCoverImage = null;
      } else {
        normalizedCoverImage = coverImageInput;
      }

      const { data: existingPost, error: fetchError } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('slug', post.slug)
        .eq('locale', lang)
        .maybeSingle();

      if (fetchError) {
        console.error(`Failed to check existing translated post for ${lang}:`, fetchError);
        continue;
      }

      const basePayload = {
        title: translatedTitle,
        excerpt: normalizedExcerpt,
        content_html: translatedContent,
        status: normalizedStatus,
        published_at: normalizedPublishedAt,
        updated_at: timestampNow
      } as Record<string, unknown>;

      if (normalizedCoverImage !== undefined) {
        basePayload.cover_image_url = normalizedCoverImage;
      }

      if (existingPost) {
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update(basePayload)
          .eq('id', existingPost.id);

        if (updateError) {
          console.error(`Failed to update translated post for ${lang}:`, updateError);
        }
      } else {
        const insertPayload = {
          slug: post.slug,
          locale: lang,
          ...basePayload
        };

        if (!('cover_image_url' in insertPayload)) {
          insertPayload.cover_image_url = normalizedCoverImage ?? null;
        }

        const { error: insertError } = await supabaseAdmin
          .from('posts')
          .insert(insertPayload);

        if (insertError) {
          console.error(`Failed to insert translated post for ${lang}:`, insertError);
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Post translated successfully' }), { status: 200 });

  } catch (error) {
    console.error('Translation process failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ message }), { status: 500 });
  }
};

serve(handler);
