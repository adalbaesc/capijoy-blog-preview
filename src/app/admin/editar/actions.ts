'use server';

import { createServerClient } from '@/lib/supabaseServer';
import { slugify } from '@/lib/slugify';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface UpdatePostState {
  message: string;
}

const COVER_IMAGE_BUCKET = 'public-post-images';

function getStoragePathFromUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const marker = `/${COVER_IMAGE_BUCKET}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(parsedUrl.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

function buildUniqueFileName(file: File): string {
  const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : undefined;
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const cleanBase = baseName
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

  return `${cleanBase || 'image'}-${Date.now()}${fileExtension ? `.${fileExtension.toLowerCase()}` : ''}`;
}

export async function updatePost(postId: string, _prevState: UpdatePostState, formData: FormData): Promise<UpdatePostState> {
  const supabase = await createServerClient({ allowCookieWrite: true });

  const title = formData.get('title');
  const slugInput = formData.get('slug');
  const sanitizedSlug = slugify(typeof slugInput === 'string' && slugInput ? slugInput : typeof title === 'string' ? title : '');
  const excerpt = formData.get('excerpt');
  const contentHtml = formData.get('content_html');
  const coverImage = formData.get('cover_image');
  const removeCoverImageFlag = formData.get('remove_cover_image');
  const currentCoverImageUrl = formData.get('current_cover_image_url');
  const localeInput = formData.get('locale');
  const originalSlug = formData.get('original_slug');
  const intentValue = formData.get('intent');
  const currentStatusValue = formData.get('current_status');
  const currentPublishedAtValue = formData.get('current_published_at');

  if (typeof title !== 'string' || typeof contentHtml !== 'string' || !sanitizedSlug) {
    return { message: 'Titulo, slug e conteudo sao obrigatorios' };
  }

  const shouldRemoveCoverImage = removeCoverImageFlag === 'on';
  const coverImageFile = coverImage instanceof File && coverImage.size > 0 ? coverImage : null;
  const hasNewCoverImage = Boolean(coverImageFile);
  const previousStoragePath = getStoragePathFromUrl(typeof currentCoverImageUrl === 'string' ? currentCoverImageUrl : null);
  const intent = intentValue === 'publish' ? 'publish' : intentValue === 'draft' ? 'draft' : 'update';
  const previousStatus = typeof currentStatusValue === 'string' && currentStatusValue ? currentStatusValue : 'draft';
  const previousPublishedAt =
    typeof currentPublishedAtValue === 'string' && currentPublishedAtValue ? currentPublishedAtValue : null;

  let nextStatus = previousStatus;
  let nextPublishedAt = previousPublishedAt;

  if (intent === 'publish') {
    nextStatus = 'published';
    if (!previousPublishedAt) {
      nextPublishedAt = new Date().toISOString();
    }
  } else if (intent === 'draft') {
    nextStatus = 'draft';
    nextPublishedAt = null;
  } else {
    nextStatus = 'published';
    if (!previousPublishedAt) {
      nextPublishedAt = new Date().toISOString();
    }
  }

  if (intent === 'publish') {
    const hasExistingCover = typeof currentCoverImageUrl === 'string' && currentCoverImageUrl && !shouldRemoveCoverImage;
    if (!coverImageFile && !hasExistingCover) {
      return {message: 'Cover image is required to publish'};
    }
  }

  let updatedCoverImageUrl: string | null | undefined = undefined;
  let newStoragePath: string | null = null;

  const persistedCoverImageUrl = typeof currentCoverImageUrl === 'string' && currentCoverImageUrl ? currentCoverImageUrl : null;

  if (coverImageFile) {
    const uniqueFileName = buildUniqueFileName(coverImageFile);

    const { error: imageError } = await supabase.storage
      .from(COVER_IMAGE_BUCKET)
      .upload(uniqueFileName, coverImageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (imageError) {
      return { message: `Failed to upload image: ${imageError.message}` };
    }

    const { data: publicUrlData } = supabase.storage.from(COVER_IMAGE_BUCKET).getPublicUrl(uniqueFileName);
    updatedCoverImageUrl = publicUrlData?.publicUrl ?? null;
    newStoragePath = uniqueFileName;
  } else if (shouldRemoveCoverImage) {
    updatedCoverImageUrl = null;
  }

  const updates: Record<string, unknown> = {
    title,
    slug: sanitizedSlug,
    excerpt: typeof excerpt === 'string' ? excerpt : null,
    content_html: contentHtml,
    status: nextStatus,
    published_at: nextPublishedAt,
    updated_at: new Date().toISOString()
  };

  if (updatedCoverImageUrl !== undefined) {
    updates.cover_image_url = updatedCoverImageUrl;
  }

  const { error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId);

  if (error) {
    if (newStoragePath) {
      await supabase.storage.from(COVER_IMAGE_BUCKET).remove([newStoragePath]);
    }

    return { message: `Falha ao atualizar: ${error.message}` };
  }

  if ((hasNewCoverImage || shouldRemoveCoverImage) && previousStoragePath) {
    await supabase.storage.from(COVER_IMAGE_BUCKET).remove([previousStoragePath]);
  }

  const resolvedLocale = typeof localeInput === 'string' && localeInput ? localeInput : 'pt';
  const blogBasePath = `/${resolvedLocale}/blog`;

  const previousStatusNormalized = previousStatus.toLowerCase();
  const nextStatusNormalized = nextStatus.toLowerCase();
  const shouldRevalidateListing = previousStatusNormalized === 'published' || nextStatusNormalized === 'published';
  const shouldRevalidateDetail = previousStatusNormalized === 'published' || nextStatusNormalized === 'published';

  revalidatePath('/admin');
  if (shouldRevalidateListing) {
    revalidatePath(blogBasePath);
  }
  if (shouldRevalidateDetail) {
    revalidatePath(`${blogBasePath}/${sanitizedSlug}`);
  }

  if (
    typeof originalSlug === 'string' &&
    originalSlug &&
    originalSlug !== sanitizedSlug &&
    (previousStatusNormalized === 'published' || nextStatusNormalized === 'published')
  ) {
    revalidatePath(`${blogBasePath}/${originalSlug}`);
  }

  const coverImageForTranslation = updatedCoverImageUrl !== undefined ? updatedCoverImageUrl : persistedCoverImageUrl;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/translate-post`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          record: {
            title,
            slug: sanitizedSlug,
            excerpt: typeof excerpt === 'string' ? excerpt : null,
            content_html: contentHtml,
            locale: resolvedLocale,
            status: nextStatus,
            published_at: nextPublishedAt,
            cover_image_url: coverImageForTranslation,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Failed to trigger translation: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }
  } catch (error) {
    console.error('Error triggering translation:', error);
  }

  redirect('/admin');
}
