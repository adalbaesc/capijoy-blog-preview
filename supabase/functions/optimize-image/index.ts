/// <reference path="../types.d.ts" />
import type { Handler } from "https://deno.land/std@0.168.0/http/server.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.4";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler: Handler = async (req) => {
  const payload = await req.json() as { record?: { object?: { name?: string; bucket_id?: string } } };
  const { name, bucket_id } = payload.record?.object ?? {};

  if (!name || !bucket_id) {
    return new Response(JSON.stringify({ message: "Missing object information" }), { status: 400 });
  }

  if (bucket_id !== 'post-images-raw') {
    return new Response(JSON.stringify({ message: 'Wrong bucket' }), { status: 400 });
  }

  try {
    const { data: blob, error: downloadError } = await supabaseAdmin.storage
      .from('post-images-raw')
      .download(name);

    if (downloadError) {
      throw downloadError;
    }

    const buffer = await blob.arrayBuffer();
    const image = await Image.decode(buffer);

    // Resize, compress and convert to WebP
    image.resize(800, Image.RESIZE_AUTO);
    const webpData = await image.encode(0.8);

    const newFileName = `${name.split('.')[0]}.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('public-post-images')
      .upload(newFileName, webpData, { contentType: 'image/webp', upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    // Update the post with the new image URL
    const { error: dbError } = await supabaseAdmin
      .from('posts')
      .update({ cover_image_url: newFileName })
      .eq('cover_image_url', name);

    if (dbError) {
      throw dbError;
    }

    return new Response(JSON.stringify({ message: 'Image optimized and updated' }), { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ message }), { status: 500 });
  }
};

serve(handler);
