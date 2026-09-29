import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireMember() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect('/member/login?error=unauthenticated');
  }

  return { userId };
}
