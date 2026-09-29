import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/member/helpers';
import { ensureMemberProfile, getPublishedUniversities } from '@/lib/member/profile';
import { getMembershipApplication } from '@/lib/member/membership';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MemberDashboard } from '@/components/member/member-dashboard';
import { redirect } from 'next/navigation';

export default async function MemberDashboardPage() {
  const { userId } = await requireMember();
  const supabase = createClient();

  const [{ data: userData }, universities, application] = await Promise.all([
    supabase.auth.getUser(),
    getPublishedUniversities(),
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

  const emailVerified = user.email_confirmed_at != null;

  const universityName = profile.university_id
    ? universities.find((u) => u.id === profile.university_id)?.name ?? null
    : null;

  return (
    <MemberDashboardShell
      userName={displayName}
      userEmail={user.email || ''}
      profileCompleted={profile.profile_completed}
    >
      <MemberDashboard
        userName={displayName}
        userEmail={user.email || ''}
        emailVerified={emailVerified}
        profileCompleted={profile.profile_completed}
        profilePhotoUrl={profile.profile_photo_url}
        application={application}
        universityName={universityName}
      />
    </MemberDashboardShell>
  );
}
