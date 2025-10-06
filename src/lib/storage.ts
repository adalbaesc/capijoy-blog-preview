const STORAGE_PUBLIC_PATH = '/storage/v1/object/public';

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (isAbsoluteUrl(path)) return path;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;

  const normalized = path.replace(/^\/+/, '');
  const hasBucket = normalized.includes('/');
  const finalPath = hasBucket ? normalized : `public-post-images/${normalized}`;

  return `${baseUrl}${STORAGE_PUBLIC_PATH}/${finalPath}`;
}
