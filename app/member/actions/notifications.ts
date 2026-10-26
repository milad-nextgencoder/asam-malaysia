'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  const { error } = await supabase
    .from('member_notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath('/member/notifications');
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  const { error } = await supabase
    .from('member_notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath('/member/notifications');
  return { ok: true as const };
}
