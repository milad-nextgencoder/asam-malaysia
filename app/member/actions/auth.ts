'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAuthCallbackUrl } from '@/lib/member/site-url';

/**
 * The origin the member actually reached this app on.
 *
 * Read from the incoming request rather than hard-coded, so a Vercel preview
 * deployment produces a redirect that returns to that same deployment. The host
 * header is only ever used to *build* a same-origin redirect target; the resulting
 * URL is still validated by Supabase's redirect allow-list.
 */
function requestOrigin(): string | null {
  try {
    const store = headers();
    const host = store.get('x-forwarded-host') || store.get('host');
    if (!host) return null;
    const proto = store.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  } catch {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false as const, message: 'Invalid email or password.' };
  revalidatePath('/member');
  return { ok: true as const };
}

export async function signUpWithEmail(email: string, password: string, firstName: string, lastName: string) {
  const supabase = createClient();
  const callbackUrl = getAuthCallbackUrl('/auth/member-callback', requestOrigin());

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl,
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function signInWithGoogle() {
  const supabase = createClient();
  // Google OAuth uses the same callback route as email confirmation so both
  // flows land in the member portal rather than on the public homepage.
  const callbackUrl = getAuthCallbackUrl('/auth/member-callback', requestOrigin());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, url: data.url };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: 'local' });
  revalidatePath('/member');
  return { ok: true as const };
}

export async function forgotPassword(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // The deliberate `next` destination is preserved: the callback honours it and
    // only accepts known internal member paths (see app/auth/member-callback).
    redirectTo: getAuthCallbackUrl('/auth/member-callback?next=/member/reset-password', requestOrigin()),
  });

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function resetPassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { ok: false as const, message: error.message };
  revalidatePath('/member');
  return { ok: true as const };
}
