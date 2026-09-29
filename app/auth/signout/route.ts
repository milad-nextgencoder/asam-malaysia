import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  const destination = new URL('/admin/login?notice=signed-out', request.url);
  let response = NextResponse.redirect(destination, 303);
  const { url, publishableKey } = getSupabaseConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) {
    response.headers.set(
      'Location',
      new URL('/admin/login?error=server-error', request.url).toString()
    );
  }

  return response;
}
