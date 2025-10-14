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
  const coverImageValue = formData.get('cover_image');
  const intent = formData.get('intent') === 'draft' ? 'draft' : 'publish';
  const locale = 'pt';

  if (typeof title !== 'string' || !title || typeof contentHtml !== 'string' || !sanitizedSlug) {
    return { message: 'Title, slug and content are required' };
  }

  const coverImageFile = coverImageValue instanceof File && coverImageValue.size > 0 ? coverImageValue : null;

  if (intent === 'publish' && !coverImageFile) {
    return { message: 'Cover image is required to publish' };
  }

  let publicUrl: string | null = null;
  let uploadedFilePath: string | null = null;

  if (coverImageFile) {
    const fileExtension = coverImageFile.name.includes('.') ? coverImageFile.name.split('.').pop() : undefined;
    const baseName = coverImageFile.name.replace(/\.[^.]+$/, '');
    const cleanBase = baseName
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
    const uniqueFileName = `${cleanBase || 'image'}-${Date.now()}${fileExtension ? `.${fileExtension.toLowerCase()}` : ''}`;

    const bucket = 'public-post-images';
    const {error: imageError} = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, coverImageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (imageError) {
      return {message: `Failed to upload image: ${imageError.message}`};
    }

    const {data: publicUrlData} = supabase.storage.from(bucket).getPublicUrl(uniqueFileName);
    publicUrl = publicUrlData?.publicUrl ?? null;
    uploadedFilePath = uniqueFileName;
  }

  const now = new Date().toISOString();
  const isPublish = intent === 'publish';

  const {error: postError} = await supabase
    .from('posts')
    .insert([
      {
        title,
        slug: sanitizedSlug,
        excerpt: typeof excerpt === 'string' ? excerpt : null,
        content_html: contentHtml,
        locale,
        status: isPublish ? 'published' : 'draft',
        published_at: isPublish ? now : null,
        cover_image_url: publicUrl
      }
    ]);

  if (postError) {
    if (uploadedFilePath) {
      await supabase.storage.from('public-post-images').remove([uploadedFilePath]);
    }
    return {message: `Failed to create post: ${postError.message}`};
  }

  const blogBasePath = `/${locale}/blog`;

  revalidatePath('/admin');
  if (isPublish) {
    revalidatePath(blogBasePath);
    revalidatePath(`${blogBasePath}/${sanitizedSlug}`);
  }

  redirect('/admin');
}
