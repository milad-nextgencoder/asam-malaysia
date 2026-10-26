'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

async function changeRegistration(eventId: string, cancel: boolean) {
  if (!z.string().uuid().safeParse(eventId).success) return { ok: false as const, message: 'Invalid event.' };
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) return { ok: false as const, message: 'Please sign in to continue.' };
  const { data: changed, error } = cancel
    ? await supabase.from('event_registrations').delete().eq('event_id', eventId).eq('user_id', data.user.id).select('id')
    : await supabase.from('event_registrations').insert({ event_id: eventId, user_id: data.user.id, status: 'registered' });
  if (error) {
    console.error('Event registration failed', { code: error.code });
    return { ok: false as const, message: error.code === '23505' ? 'You are already registered for this event.' : 'Registration could not be changed. The event may be closed or unavailable.' };
  }
  if (cancel && (!changed || changed.length === 0)) return { ok: false as const, message: 'This registration could not be cancelled. The event may have already started. Refresh to see its current status.' };
  revalidatePath('/member/events');
  return { ok: true as const };
}
export async function registerForEvent(eventId: string) { return changeRegistration(eventId, false); }
export async function cancelEventRegistration(eventId: string) { return changeRegistration(eventId, true); }
