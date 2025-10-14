'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import TiptapEditor from '@/components/TiptapEditor';
import { createPost, type CreatePostState } from './actions';

const initialState: CreatePostState = { message: '' };

export default function NewPostPage() {
  const [state, formAction] = useActionState<CreatePostState, FormData>(createPost, initialState);
  const [isPending, startTransition] = useTransition();
  const [submissionIntent, setSubmissionIntent] = useState<'publish' | 'draft'>('publish');
  const intentRef = useRef<'publish' | 'draft'>('publish');
  const [contentHtml, setContentHtml] = useState('');

  const handleSubmit = (formData: FormData) => {
    formData.set('intent', intentRef.current);
    startTransition(() => formAction(formData));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-neutral-900">Create a New Post</h1>
      <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full px-3 py-2 mt-1 text-neutral-900 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-neutral-400"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-neutral-700">Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            className="w-full px-3 py-2 mt-1 text-neutral-900 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-neutral-400"
          />
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-700">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            className="w-full px-3 py-2 mt-1 text-neutral-900 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-neutral-400"
          ></textarea>
        </div>
        <div>
          <label htmlFor="cover_image" className="block text-sm font-medium text-neutral-700">Cover Image</label>
          <input
            id="cover_image"
            name="cover_image"
            type="file"
            accept="image/*"
            className="w-full px-3 py-2 mt-1 text-neutral-900 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-neutral-400"
          />
          <p className="mt-1 text-xs text-neutral-500">Obrigatorio apenas ao publicar.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Content</label>
          <TiptapEditor initialContent="" onContentChange={setContentHtml} />
          <input type="hidden" name="content_html" value={contentHtml} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button
              type="submit"
              onClick={() => {
                intentRef.current = 'publish';
                setSubmissionIntent('publish');
              }}
              className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 sm:flex-none"
              disabled={isPending}
            >
              {isPending && submissionIntent === 'publish' ? 'Publicando...' : 'Publicar agora'}
            </button>
            <button
              type="submit"
              onClick={() => {
                intentRef.current = 'draft';
                setSubmissionIntent('draft');
              }}
              className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 sm:flex-none"
              disabled={isPending}
            >
              {isPending && submissionIntent === 'draft' ? 'Salvando...' : 'Salvar rascunho'}
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            Rascunhos permanecem privados ate a publicacao.
          </p>
        </div>
        {state?.message && (
          <p className="text-sm text-red-500" role="alert">
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
