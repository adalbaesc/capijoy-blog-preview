const DEFAULT_BASE_URL = 'http://localhost:3000';

export function getSiteBaseUrl(): string {
  const base = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_BASE_URL;
  try {
    const url = new URL(base);
    return url.origin;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

export function absoluteUrl(path: string): string {
  const base = getSiteBaseUrl();
  try {
    return new URL(path, base).toString();
  } catch {
    return base;
  }
}
