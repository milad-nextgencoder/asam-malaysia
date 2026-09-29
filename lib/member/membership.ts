import { createClient } from '@/lib/supabase/server';
import type { MembershipApplication } from './types';

export async function getMembershipApplication(userId: string): Promise<MembershipApplication | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('membership_applications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export async function submitMembershipApplication(userId: string): Promise<MembershipApplication> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('submit_membership_application');
  if (error) throw error;
  return data;
}

export async function startMembershipReview(
  adminUserId: string,
  memberUserId: string
): Promise<MembershipApplication> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('start_membership_review', {
    p_member_user_id: memberUserId,
  });
  if (error) throw error;
  return data;
}

export async function approveMembershipApplication(
  adminUserId: string,
  memberUserId: string
): Promise<MembershipApplication> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('approve_membership_application', {
    p_member_user_id: memberUserId,
  });
  if (error) throw error;
  return data;
}

export async function rejectMembershipApplication(
  adminUserId: string,
  memberUserId: string,
  reason: string
): Promise<MembershipApplication> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('reject_membership_application', {
    p_member_user_id: memberUserId,
    p_reason: reason,
  });
  if (error) throw error;
  return data;
}
