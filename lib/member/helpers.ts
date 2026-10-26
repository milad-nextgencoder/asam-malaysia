import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Deduplicated only within one server render, never cached across accounts. */
export const getMemberAuth = cache(async () => (await createClient()).auth.getUser());
export async function requireMember() {
  const { data,error } = await getMemberAuth();
  if (error || !data.user) redirect('/member/login?error=unauthenticated');
  return { userId: data.user.id };
}
