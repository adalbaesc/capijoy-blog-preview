import {createServerClient as createClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function hasSupabaseEnv() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createServerClient({allowCookieWrite = false}: {allowCookieWrite?: boolean} = {}) {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          if (!allowCookieWrite) return;
          (cookieStore as CookieStore & {set?: (key: string, value: string, opts?: Record<string, unknown>) => void}).set?.(
            name,
            value,
            options
          );
        },
        remove(name: string, options) {
          if (!allowCookieWrite) return;
          const store = cookieStore as CookieStore & {
            delete?: (key: string) => void;
            set?: (key: string, value: string, opts?: Record<string, unknown>) => void;
          };
          store.delete?.(name);
          store.set?.(name, '', {
            ...(options ?? {}),
            maxAge: 0
          });
        }
      }
    }
  );
}
