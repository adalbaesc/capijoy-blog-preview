'use server';

import { createServerClient } from "@/lib/supabaseServer";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface CreatePostState {
  message: string;
}

export async function createPost(_prevState: CreatePostState, formData: FormData): Promise<CreatePostState> {
  const supabase = await createServerClient({allowCookieWrite: true});

  const title = formData.get('title');
  const slugInput = formData.get('slug');
  const sanitizedSlug = slugify(typeof slugInput === 'string' && slugInput ? slugInput : typeof title === 'string' ? title : '');
  const excerpt = formData.get('excerpt');
  const contentHtml = formData.get('content_html');
  const coverImage = formData.get('cover_image');

  if (typeof title !== 'string' || !title || typeof contentHtml !== 'string' || !(coverImage instanceof File) || !sanitizedSlug) {
    return { message: 'Title, slug, content and cover image are required' };
  }

  const fileExtension = coverImage.name.includes('.') ? coverImage.name.split('.').pop() : undefined;
  const baseName = coverImage.name.replace(/\.[^.]+$/, '');
  const cleanBase = baseName
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  const uniqueFileName = `${cleanBase || 'image'}-${Date.now()}${fileExtension ? `.${fileExtension.toLowerCase()}` : ''}`;

  const bucket = 'public-post-images';
  const { error: imageError } = await supabase.storage
    .from(bucket)
    .upload(uniqueFileName, coverImage, {
      cacheControl: '3600',
      upsert: false
    });

  if (imageError) {
    return { message: `Failed to upload image: ${imageError.message}` };
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uniqueFileName);
  const publicUrl = publicUrlData?.publicUrl ?? null;

  const { error: postError } = await supabase
    .from('posts')
    .insert([
      {
        title,
        slug: sanitizedSlug,
        excerpt: typeof excerpt === 'string' ? excerpt : null,
        content_html: contentHtml,
        locale: 'pt',
        status: 'published',
        published_at: new Date().toISOString(),
        cover_image_url: publicUrl,
      },
    ]);

  if (postError) {
    return { message: `Failed to create post: ${postError.message}` };
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${sanitizedSlug}`);

  redirect('/admin');
}
