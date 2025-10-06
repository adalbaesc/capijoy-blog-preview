'use server';

import { createServerClient } from '@/lib/supabaseServer';
import { slugify } from '@/lib/slugify';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface UpdatePostState {
  message: string;
}

export async function updatePost(postId: string, _prevState: UpdatePostState, formData: FormData): Promise<UpdatePostState> {
  const supabase = await createServerClient({allowCookieWrite: true});

  const title = formData.get('title');
  const slugInput = formData.get('slug');
  const sanitizedSlug = slugify(typeof slugInput === 'string' && slugInput ? slugInput : typeof title === 'string' ? title : '');
  const excerpt = formData.get('excerpt');
  const contentHtml = formData.get('content_html');

  if (typeof title !== 'string' || typeof contentHtml !== 'string' || !sanitizedSlug) {
    return {message: 'Título, slug e conteúdo são obrigatórios'};
  }

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      slug: sanitizedSlug,
      excerpt: typeof excerpt === 'string' ? excerpt : null,
      content_html: contentHtml,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId);

  if (error) {
    return {message: `Falha ao atualizar: ${error.message}`};
  }

  revalidatePath('/admin');
  revalidatePath(`/blog/${sanitizedSlug}`);

  redirect('/admin');
}
