'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAuthCallbackUrl } from '@/lib/member/site-url';
import { normalizeEmail, registrationError, registrationMessage } from '@/lib/member/validation';

async function requestOrigin(): Promise<string | null> {
  const store = await headers();
  const host = store.get('x-forwarded-host') || store.get('host');
  if (!host) return null;
  return (store.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')) + '://' + host;
}

export async function signInWithEmail(email: string, password: string) {
  if (typeof email !== 'string' || typeof password !== 'string') return { ok: false as const, message: 'Enter your email and password.' };
  const { error } = await (await createClient()).auth.signInWithPassword({ email: normalizeEmail(email), password });
  if (error) return { ok: false as const, message: 'We could not sign you in. Check your email, password, and email confirmation.' };
  revalidatePath('/member', 'layout');
  return { ok: true as const };
}

export async function signUpWithEmail(email: string, password: string, firstName: string, lastName: string) {
  if ([email, password, firstName, lastName].some((value) => typeof value !== 'string')) return { ok: false as const, message: 'Please check your registration details.' };
  const invalid = registrationError({ email, password, firstName, lastName });
  if (invalid) return { ok: false as const, message: invalid };
  const { data, error } = await (await createClient()).auth.signUp({
    email: normalizeEmail(email), password,
    options: {
      emailRedirectTo: getAuthCallbackUrl('/auth/member-callback', await requestOrigin()),
      data: { first_name: firstName.trim(), last_name: lastName.trim(), full_name: [firstName.trim(), lastName.trim()].join(' ') },
    },
  });
  if (error) {
    if (error.code === 'user_already_exists' || error.code === 'email_exists') return { ok: true as const, message: registrationMessage({ identities: [] }), signedIn: false };
    return { ok: false as const, message: error.status === 429 ? 'Too many attempts. Please wait before trying again.' : 'Registration could not be completed. Try again, or sign in if you already have an account.' };
  }
  return { ok: true as const, message: registrationMessage(data.user), signedIn: Boolean(data.session) };
}

export async function signInWithGoogle() {
  const { data, error } = await (await createClient()).auth.signInWithOAuth({
    provider: 'google', options: { redirectTo: getAuthCallbackUrl('/auth/member-callback', await requestOrigin()) },
  });
  if (error) return { ok: false as const, message: 'Google sign-in is temporarily unavailable. Please try again.' };
  return { ok: true as const, url: data.url };
}

export async function signOut() {
  const { error } = await (await createClient()).auth.signOut({ scope: 'local' });
  if (error) throw new Error('Sign-out failed. Please try again.');
  revalidatePath('/member', 'layout');
  redirect('/member/login?notice=signed-out');
}

export async function forgotPassword(email: string) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) return { ok: false as const, message: 'Enter a valid email address.' };
  const { error } = await (await createClient()).auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: getAuthCallbackUrl('/auth/member-callback?next=/member/reset-password', await requestOrigin()),
  });
  if (error) return { ok: false as const, message: 'A reset link could not be requested. Please wait and try again.' };
  return { ok: true as const };
}

export async function resetPassword(newPassword: string) {
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) return { ok: false as const, message: 'Use a password between 8 and 128 characters.' };
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) return { ok: false as const, message: 'Your reset link has expired. Please request a new one.' };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false as const, message: 'Your password could not be updated. Please request a new reset link.' };
  await supabase.auth.signOut({ scope: 'local' });
  revalidatePath('/member', 'layout');
  return { ok: true as const };
}
