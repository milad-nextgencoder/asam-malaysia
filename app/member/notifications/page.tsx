import { createClient } from '@/lib/supabase/server';
import { requireMember, getMemberAuth } from '@/lib/member/helpers';
import { ensureMemberProfile } from '@/lib/member/profile';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MemberNotificationsList } from '@/components/member/member-notifications-list';
import { DirectoryPagination } from '@/components/admin/directory-pagination';
import { ADMIN_PAGE_SIZE, readDirectoryParams } from '@/lib/admin/pagination';
import { redirect } from 'next/navigation';

export default async function MemberNotificationsPage({ searchParams }: { searchParams?: Promise<Record<string,string|string[]|undefined>> }) {
  const { page,offset } = readDirectoryParams(await searchParams);
  const { userId } = await requireMember();
  const supabase = await createClient();

  const [{ data: userData }, { data: notifications, error: notificationsError, count }] = await Promise.all([
    getMemberAuth(),
    supabase
      .from('member_notifications')
      .select('id, title, message, type, link, read, created_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id').range(offset,offset + ADMIN_PAGE_SIZE - 1),
  ]);

  if (notificationsError) throw new Error('Your notifications could not be loaded. Please try again.');
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
      <DirectoryPagination base="/member/notifications" page={page} total={count || 0} />
    </MemberDashboardShell>
  );
}
