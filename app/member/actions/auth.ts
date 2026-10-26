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
  if (error) {
    if (error.code === 'email_not_confirmed') return { ok: false as const, message: 'Confirm your email using the link we sent before signing in. Request a new link from Create Account if needed.' };
    if (error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit') return { ok: false as const, message: 'Too many attempts. Wait a few minutes before trying again.' };
    return { ok: false as const, message: 'That email and password did not match. If you registered with Google, choose Sign in with Google. Otherwise reset your password and try again.' };
  }
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
    if (error.code === 'user_already_exists' || error.code === 'email_exists') return { ok: true as const, accountExists: true as const, message: registrationMessage({ identities: [] }), signedIn: false };
    if (error.code === 'over_email_send_rate_limit') return { ok: false as const, message: 'We could not send your confirmation email because our email service has reached its sending limit. Please try again later.' };
    return { ok: false as const, message: error.status === 429 ? 'Please wait a moment before trying again.' : 'Registration could not be completed. Please try again.' };
  }
  const accountExists = Boolean(data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);
  return { ok: true as const, accountExists, message: registrationMessage(data.user), signedIn: Boolean(data.session) };
}

export async function resendSignupConfirmation(email: string) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) return { ok: false as const, message: 'Enter your email address first.' };
  const { error } = await (await createClient()).auth.resend({ type: 'signup', email: normalizeEmail(email), options: { emailRedirectTo: getAuthCallbackUrl('/auth/member-callback', await requestOrigin()) } });
  if (error) return { ok: false as const, message: error.status === 429 || error.code === 'over_email_send_rate_limit' ? 'The email service is temporarily rate limited. Wait a little and try again, then check your inbox and spam folder.' : 'We could not send the confirmation link. Check the email address and try again.' };
  return { ok: true as const, message: 'If this address has a pending account, a confirmation link is on its way. Check your inbox and spam folder.' };
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
  if (error) return { ok: false as const, message: error.status === 429 || error.code === 'over_email_send_rate_limit' ? 'The email service has reached its sending limit. Wait a while before requesting another link, then check your inbox and spam folder.' : 'A reset link could not be requested. Check the address and try again.' };
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
