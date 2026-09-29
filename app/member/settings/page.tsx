import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/member/helpers';
import { ensureMemberProfile } from '@/lib/member/profile';
import { getMembershipApplication } from '@/lib/member/membership';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MemberSettingsPage } from '@/components/member/member-settings';
import { redirect } from 'next/navigation';

export default async function MemberSettings() {
  const { userId } = await requireMember();
  const supabase = createClient();

  const [{ data: userData }, application] = await Promise.all([
    supabase.auth.getUser(),
    getMembershipApplication(userId),
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
      <MemberSettingsPage
        userName={displayName}
        userEmail={user.email || ''}
        emailVerified={user.email_confirmed_at != null}
        membershipStatus={application?.status ?? 'draft'}
        memberId={application?.member_id ?? null}
      />
    </MemberDashboardShell>
  );
}
