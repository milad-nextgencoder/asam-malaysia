import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Destinations the callback is allowed to forward to.
 *
 * A `next` parameter is honoured deliberately (password recovery needs
 * /member/reset-password) rather than every callback being forced to /member, but
 * it is restricted to this exact allow-list so the parameter can never be used as
 * an open redirect to an external site.
 */
const ALLOWED_NEXT_PATHS = ['/member/reset-password'] as const;

/** Members are sent to the portal, where the next step is shown in context. */
const MEMBER_DESTINATION = '/member';

function resolveNextPath(request: NextRequest): string {
  const next = request.nextUrl.searchParams.get('next');
  if (next && (ALLOWED_NEXT_PATHS as readonly string[]).includes(next)) {
    return next;
  }
  return MEMBER_DESTINATION;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const nextPath = resolveNextPath(request);

  if (!code) {
    return NextResponse.redirect(new URL('/member/login?error=callback', request.url));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Never silently fall through to the public homepage: an unauthenticated
    // visitor must be sent back to the member login with a readable reason.
    console.error('Member auth callback failed to exchange code:', error);
    return NextResponse.redirect(new URL('/member/login?error=callback', request.url));
  }

  // The password-recovery flow keeps its own destination; every other successful
  // authentication (email confirmation and Google OAuth alike) lands in the member
  // portal with a confirmation flag, so the portal can acknowledge the sign-in
  // instead of the member wondering where they ended up.
  const destination = new URL(nextPath, request.url);
  if (nextPath === MEMBER_DESTINATION) {
    destination.searchParams.set('authenticated', '1');
  }

  return NextResponse.redirect(destination);
}
