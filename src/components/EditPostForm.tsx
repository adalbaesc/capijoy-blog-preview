'use client';

import { useActionState, useState } from 'react';
import { updatePost, type UpdatePostState } from '../app/admin/editar/actions';
import TiptapEditor from '@/components/TiptapEditor';

interface EditPostFormProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content_html: string;
    locale: string;
    status: string;
    cover_image_url: string | null;
  };
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const boundUpdate = updatePost.bind(null, post.id);
  const initialState: UpdatePostState = { message: '' };
  const [state, formAction] = useActionState<UpdatePostState, FormData>(
    boundUpdate,
    initialState
  );
  const [contentHtml, setContentHtml] = useState(post.content_html);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          Titulo
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={post.title}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          defaultValue={post.slug}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          Resumo
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          defaultValue={post.excerpt ?? ''}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">
          Conteudo
        </label>
        <TiptapEditor
          initialContent={post.content_html}
          onContentChange={setContentHtml}
        />
        <input type="hidden" name="content_html" value={contentHtml} />
      </div>

      {state.message && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Salvar alteracoes
      </button>
    </form>
  );
}
