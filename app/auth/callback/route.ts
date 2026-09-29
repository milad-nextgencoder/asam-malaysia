import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const nextPath = request.nextUrl.searchParams.get('next') === '/auth/reset-password'
    ? '/auth/reset-password'
    : '/admin';

  if (!code) {
    return NextResponse.redirect(new URL('/admin/login?error=callback', request.url));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/admin/login?error=callback', request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
