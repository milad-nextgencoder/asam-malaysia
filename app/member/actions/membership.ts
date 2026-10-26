'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Notifications, audit events, IDs and certificate snapshots commit in the same database transaction.
function refreshMembership(userId: string) {
  ['/admin', '/admin/members', '/admin/applications', '/admin/members/' + userId, '/member', '/member/membership', '/member/notifications'].forEach((path) => revalidatePath(path));
}

async function perform(operation: string, memberUserId?: string, reason?: string) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) return { ok: false as const, message: 'Please sign in to continue.' };
  if (memberUserId && !z.string().uuid().safeParse(memberUserId).success) return { ok: false as const, message: 'Invalid member.' };
  const args = operation === 'submit_membership_application' ? undefined
    : { p_member_user_id: memberUserId, ...(operation === 'reject_membership_application' ? { p_reason: reason?.trim() } : {}) };
  const { data: application, error } = await supabase.rpc(operation, args);
  if (error) {
    console.error('Membership operation failed', { operation, code: error.code, message: error.message });
    // Only explicitly user-facing business exceptions are returned.
    const message = error.code === 'P0001' && error.message.length <= 240
      ? error.message : 'The membership change could not be saved. Refresh and try again.';
    return { ok: false as const, message };
  }
  refreshMembership(memberUserId || data.user.id);
  return { ok: true as const, application };
}

export async function submitApplication() { return perform('submit_membership_application'); }
export async function startReviewAction(memberUserId: string) { return perform('start_membership_review', memberUserId); }
export async function approveMemberAction(memberUserId: string) { return perform('approve_membership_application', memberUserId); }
export async function rejectMemberAction(memberUserId: string, reason: string) {
  if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 2000) return { ok: false as const, message: 'Provide a rejection reason of up to 2,000 characters.' };
  return perform('reject_membership_application', memberUserId, reason);
}
