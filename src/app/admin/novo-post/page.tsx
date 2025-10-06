'use client';

import { useActionState, useState, useTransition } from 'react';
import TiptapEditor from '@/components/TiptapEditor';
import { createPost, type CreatePostState } from './actions';

const initialState: CreatePostState = { message: '' };

export default function NewPostPage() {
  const [state, formAction] = useActionState<CreatePostState, FormData>(createPost, initialState);
  const [isPending, startTransition] = useTransition();
  const [contentHtml, setContentHtml] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
      <form
        action={formData => startTransition(() => formAction(formData))}
        className="space-y-6"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          ></textarea>
        </div>
        <div>
          <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
          <input
            id="cover_image"
            name="cover_image"
            type="file"
            accept="image/*"
            required
            className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
          <TiptapEditor initialContent="" onContentChange={setContentHtml} />
          <input type="hidden" name="content_html" value={contentHtml} />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
          disabled={isPending}
        >
          {isPending ? 'Creating...' : 'Create Post'}
        </button>
        {state?.message && (
          <p className="text-sm text-red-500" role="alert">
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
