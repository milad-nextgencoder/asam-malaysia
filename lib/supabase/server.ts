import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; middleware refreshes sessions.
        }
      },
    },
  });
}

/**
 * Cookieless server-side client for anonymous public content reads.
 *
 * createClient() above calls cookies(), which forces the route into dynamic
 * rendering and defeats ISR. Public list pages (events, news, gallery,
 * chapters) only read rows the anon role may read anyway (status =
 * 'published' via RLS), so they use this client instead: no request cookies
 * are touched, the query runs as an anonymous reader, and the page stays
 * eligible for `export const revalidate = ...` caching.
 */
export function createPublicClient() {
  const { url, publishableKey } = getSupabaseConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No session to persist for anonymous public reads.
      },
    },
  });
}
