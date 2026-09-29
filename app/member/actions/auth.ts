'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false as const, message: 'Invalid email or password.' };
  revalidatePath('/member');
  return { ok: true as const };
}

export async function signUpWithEmail(email: string, password: string, firstName: string, lastName: string) {
  const supabase = createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/member-callback`,
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/member-callback`,
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
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/member-callback?next=/member/reset-password`,
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
