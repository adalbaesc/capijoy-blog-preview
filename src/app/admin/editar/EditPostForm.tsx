'use client';

import {useActionState, useRef, useState, type ChangeEvent} from 'react';
import {updatePost, type UpdatePostState} from './actions';
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
    published_at: string | null;
    cover_image_url: string | null;
  };
}

export default function EditPostForm({post}: EditPostFormProps) {
  const boundUpdate = updatePost.bind(null, post.id);
  const initialState: UpdatePostState = {message: ''};
  const [state, formAction] = useActionState<UpdatePostState, FormData>(boundUpdate, initialState);
  const [contentHtml, setContentHtml] = useState(post.content_html);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [selectedCoverImageName, setSelectedCoverImageName] = useState<string | null>(null);
  const intentRef = useRef<'update' | 'publish' | 'draft'>(post.status === 'published' ? 'update' : 'draft');

  const handleCoverImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedCoverImageName(file ? file.name : null);

    if (file) {
      setRemoveCoverImage(false);
    }
  };

  const handleRemoveCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRemoveCoverImage(event.target.checked);

    if (event.target.checked) {
      setSelectedCoverImageName(null);
    }
  };

  return (
    <form
      action={formData => {
        formData.set('intent', intentRef.current);
        formAction(formData);
      }}
      encType="multipart/form-data"
      className="space-y-6 max-w-3xl"
    >
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
          Titulo
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={post.title}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-neutral-400"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-neutral-700">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          defaultValue={post.slug}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-neutral-400"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-700">
          Resumo
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          defaultValue={post.excerpt ?? ''}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-neutral-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Conteudo</label>
        <TiptapEditor initialContent={post.content_html} onContentChange={setContentHtml} />
        <input type="hidden" name="content_html" value={contentHtml} />
        <input type="hidden" name="locale" value={post.locale} />
        <input type="hidden" name="original_slug" value={post.slug} />
        <input type="hidden" name="current_status" value={post.status} />
        <input type="hidden" name="current_published_at" value={post.published_at ?? ''} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="cover_image" className="block text-sm font-medium text-neutral-700">
            Imagem de capa
          </label>
          {post.cover_image_url && (
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                id="remove_cover_image"
                name="remove_cover_image"
                type="checkbox"
                value="on"
                checked={removeCoverImage}
                onChange={handleRemoveCoverChange}
                className="h-4 w-4 rounded border border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remover imagem atual
            </label>
          )}
        </div>

        {post.cover_image_url && !removeCoverImage && (
          <div className="mt-2 overflow-hidden rounded-md border border-neutral-200 bg-white">
            <img src={post.cover_image_url} alt={`Imagem de capa atual de ${post.title}`} className="h-48 w-full object-cover" />
          </div>
        )}

        <input
          id="cover_image"
          name="cover_image"
          type="file"
          accept="image/*"
          disabled={removeCoverImage}
          onChange={handleCoverImageChange}
          className="mt-2 w-full cursor-pointer rounded-md border border-dashed border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
        />

        {selectedCoverImageName && (
          <p className="mt-1 text-sm text-neutral-500">Nova imagem selecionada: {selectedCoverImageName}</p>
        )}

        <input type="hidden" name="current_cover_image_url" value={post.cover_image_url ?? ''} />
      </div>

      {state.message && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {post.status === 'published' ? (
        <button
          type="submit"
          onClick={() => {
            intentRef.current = 'update';
          }}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Salvar alteracoes
        </button>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
          <button
            type="submit"
            onClick={() => {
              intentRef.current = 'publish';
            }}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Publicar agora
          </button>
          <button
            type="submit"
            onClick={() => {
              intentRef.current = 'draft';
            }}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Salvar rascunho
          </button>
        </div>
      )}
    </form>
  );
}
