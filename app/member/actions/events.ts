'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function registerForEvent(eventId: string) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  const { data: existing } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { ok: false as const, message: 'Already registered for this event.' };
  }

  const { error } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
    });

  if (error) {
    if (error.code === '23505') {
      return { ok: false as const, message: 'Already registered for this event.' };
    }
    return { ok: false as const, message: error.message };
  }

  revalidatePath('/member/events');
  return { ok: true as const };
}

export async function cancelEventRegistration(eventId: string) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath('/member/events');
  return { ok: true as const };
}
