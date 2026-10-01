import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/member/helpers';
import { ensureMemberProfile, getPublishedUniversities } from '@/lib/member/profile';
import { getMembershipApplication } from '@/lib/member/membership';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MemberDashboard } from '@/components/member/member-dashboard';
import { AuthenticatedWelcome } from '@/components/member/authenticated-welcome';
import { redirect } from 'next/navigation';

interface MemberDashboardPageProps {
  searchParams?: { authenticated?: string | string[] };
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MemberDashboardPage({ searchParams }: MemberDashboardPageProps) {
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

  // Set by /auth/member-callback after a successful email confirmation or Google
  // sign-in, so the member sees a clear confirmation instead of silently landing
  // on the portal with no explanation.
  const justAuthenticated = firstValue(searchParams?.authenticated) === '1';

  const universityName = profile.university_id
    ? universities.find((u) => u.id === profile.university_id)?.name ?? null
    : null;

  return (
    <MemberDashboardShell
      userName={displayName}
      userEmail={user.email || ''}
      profileCompleted={profile.profile_completed}
    >
      <div className="space-y-6">
        {justAuthenticated && (
          <AuthenticatedWelcome
            emailVerified={emailVerified}
            profileCompleted={profile.profile_completed}
            hasApplication={Boolean(application)}
          />
        )}
        <MemberDashboard
          userName={displayName}
          userEmail={user.email || ''}
          emailVerified={emailVerified}
          profileCompleted={profile.profile_completed}
          profilePhotoUrl={profile.profile_photo_url}
          application={application}
          universityName={universityName}
        />
      </div>
    </MemberDashboardShell>
  );
}
