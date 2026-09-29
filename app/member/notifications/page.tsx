import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/member/helpers';
import { ensureMemberProfile } from '@/lib/member/profile';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MemberNotificationsList } from '@/components/member/member-notifications-list';
import { redirect } from 'next/navigation';

export default async function MemberNotificationsPage() {
  const { userId } = await requireMember();
  const supabase = createClient();

  const [{ data: userData }, { data: notifications }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('member_notifications')
      .select('id, title, message, type, link, read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const user = userData.user;

  if (!user) {
    redirect('/member/login?error=unauthenticated');
  }

  const profile = await ensureMemberProfile(userId, user.user_metadata);

  const displayName =
    profile.preferred_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    user.email ||
    'Member';

  return (
    <MemberDashboardShell
      userName={displayName}
      userEmail={user.email || ''}
      profileCompleted={profile.profile_completed}
    >
      <MemberNotificationsList notifications={notifications ?? []} />
    </MemberDashboardShell>
  );
}
