import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from './config';

export async function protectMemberRoutes(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  const isMemberRoute = pathname === '/member' || pathname.startsWith('/member/');
  const isPublicMemberRoute = [
    '/member/login',
    '/member/register',
    '/member/forgot-password',
    '/member/reset-password',
  ].includes(pathname);

  if (!isMemberRoute || isPublicMemberRoute) {
    return response;
  }

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

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    const loginUrl = new URL('/member/login', request.url);
    loginUrl.searchParams.set('error', 'unauthenticated');
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  // Only admin routes need the admin session and role checks performed here.
  // Member routes are checked separately by protectMemberRoutes, while public
  // routes should not wait for an admin authentication request.
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminLoginRoute = pathname === '/admin/login';

  if (!isAdminRoute || isAdminLoginRoute) {
    return response;
  }

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

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) {
    const hasAuthCookie = request.cookies
      .getAll()
      .some(({ name }) => name.startsWith('sb-') && /-auth-token(?:\.\d+)?$/.test(name));

    return redirectToLogin(request, response, hasAuthCookie ? 'session-expired' : 'unauthenticated');
  }

  const { data: adminRole, error: roleError } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleError) {
    return redirectToLogin(request, response, 'server-error');
  }

  if (!adminRole || !['SUPER_ADMIN', 'EDITOR'].includes(adminRole.role)) {
    return redirectToLogin(request, response, 'unauthorized');
  }

  return response;
}

function redirectToLogin(
  request: NextRequest,
  response: NextResponse,
  error: string
) {
  const destination = request.nextUrl.clone();
  destination.pathname = '/admin/login';
  destination.search = '';
  destination.searchParams.set('error', error);

  const redirectResponse = NextResponse.redirect(destination);
  response.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirectResponse.cookies.set(name, value, options);
  });

  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = response.headers.get(header);
    if (value) redirectResponse.headers.set(header, value);
  }

  return redirectResponse;
}
