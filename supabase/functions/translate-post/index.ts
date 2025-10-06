import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.4";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const translate = async (text: string, lang: string) => {
  if (!text) return "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|${lang}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to translate text: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  const json = await response.json();
  return json.responseData.translatedText;
};

serve(async (req) => {
  const { record: post } = await req.json();

  if (post.locale !== 'pt') {
    return new Response(JSON.stringify({ message: 'Post is not in Portuguese, skipping translation' }), { status: 200 });
  }

  const targetLanguages = ['en', 'es'];

  try {
    for (const lang of targetLanguages) {
      // Add a delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));

      const [translatedTitle, translatedExcerpt, translatedContent] = await Promise.all([
        translate(post.title, lang),
        translate(post.excerpt, lang),
        translate(post.content_html, lang)
      ]);

      const { error } = await supabaseAdmin.from('posts').insert({
        ...post,
        id: undefined, // Let the database generate a new UUID
        locale: lang,
        title: translatedTitle,
        excerpt: translatedExcerpt,
        content_html: translatedContent,
        status: 'draft', // Translated posts are drafts by default
      });

      if (error) {
        console.error(`Failed to insert translated post for ${lang}:`, error);
        // Continue to the next language even if one fails
      }
    }

    return new Response(JSON.stringify({ message: 'Post translated successfully' }), { status: 200 });

  } catch (error) {
    console.error('Translation process failed:', error);
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});
