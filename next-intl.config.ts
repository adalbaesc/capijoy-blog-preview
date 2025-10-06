import {defineRouting} from 'next-intl/routing';

export default defineRouting({
  locales: ['pt', 'en', 'es'] as const,
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/login': '/login',
    '/admin': '/admin',
    '/admin/novo-post': '/admin/novo-post',
    '/admin/editar/[slug]': '/admin/editar/[slug]'
  } as const
});
