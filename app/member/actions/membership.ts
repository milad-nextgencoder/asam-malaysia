'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { submitMembershipApplication, startMembershipReview, approveMembershipApplication, rejectMembershipApplication } from '@/lib/member/membership';

/**
 * Writes a member notification.
 *
 * A notification must never undo the membership action that triggered it, so a
 * failure is logged instead of thrown. Until
 * supabase/migrations/20260930020000_member_portal_tables.sql is applied the
 * insert fails because the table and its INSERT policies do not exist, which is
 * exactly the case this makes visible in the server log.
 */
async function notifyMember(
  supabase: ReturnType<typeof createClient>,
  notification: {
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link: string;
  }
): Promise<boolean> {
  const { error } = await supabase.from('member_notifications').insert(notification);
  if (error) {
    console.error('member notification failed:', error);
    return false;
  }
  return true;
}

export async function submitApplication() {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) return { ok: false as const, message: 'Not authenticated.' };

  try {
    const application = await submitMembershipApplication(userId);

    // Notify member of submission
    await notifyMember(supabase, {
      user_id: userId,
      title: 'Application Submitted',
      message: 'Your ASAM membership application has been submitted successfully and is now awaiting review.',
      type: 'info',
      link: '/member/membership',
    });

    revalidatePath('/member');
    revalidatePath('/member/membership');
    return { ok: true as const, application };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : 'Submission failed.' };
  }
}

export async function startReviewAction(memberUserId: string) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const adminUserId = data?.claims?.sub;

  if (!adminUserId) return { ok: false as const, message: 'Not authenticated.' };

  try {
    const application = await startMembershipReview(adminUserId, memberUserId);
    revalidatePath('/admin/members');
    return { ok: true as const, application };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : 'Review start failed.' };
  }
}

export async function approveMemberAction(memberUserId: string) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const adminUserId = data?.claims?.sub;

  if (!adminUserId) return { ok: false as const, message: 'Not authenticated.' };

  try {
    const application = await approveMembershipApplication(adminUserId, memberUserId);

    // Notify member of approval
    await notifyMember(supabase, {
      user_id: memberUserId,
      title: 'Membership Approved',
      message: `Congratulations! Your ASAM membership has been approved. Your Member ID is ${application.member_id}.`,
      type: 'success',
      link: '/member/membership',
    });

    revalidatePath('/admin/members');
    return { ok: true as const, application };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : 'Approval failed.' };
  }
}

export async function rejectMemberAction(memberUserId: string, reason: string) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const adminUserId = data?.claims?.sub;

  if (!adminUserId) return { ok: false as const, message: 'Not authenticated.' };

  try {
    const application = await rejectMembershipApplication(adminUserId, memberUserId, reason);

    // Notify member of rejection
    await notifyMember(supabase, {
      user_id: memberUserId,
      title: 'Membership Application Update',
      message: `Your ASAM membership application has been reviewed. Please check your membership page for details.`,
      type: 'warning',
      link: '/member/membership',
    });

    revalidatePath('/admin/members');
    return { ok: true as const, application };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : 'Rejection failed.' };
  }
}
