import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/member/helpers';
import { ensureMemberProfile, getPublishedUniversities } from '@/lib/member/profile';
import { getMembershipApplication } from '@/lib/member/membership';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MembershipStatusCard } from '@/components/member/membership-status';
import { MembershipCard } from '@/components/member/membership-card';
import { redirect } from 'next/navigation';

export default async function MemberMembershipPage() {
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

  const universityName = profile.university_id
    ? universities.find((u) => u.id === profile.university_id)?.name ?? null
    : null;

  const completionChecks = {
    first_name: profile.first_name?.trim() ? true : false,
    last_name: profile.last_name?.trim() ? true : false,
    preferred_name: profile.preferred_name?.trim() ? true : false,
    phone: profile.phone?.trim() ? true : false,
    profile_photo_url: profile.profile_photo_url?.trim() ? true : false,
    university_id: profile.university_id ? true : false,
    program: profile.program?.trim() ? true : false,
    faculty: profile.faculty?.trim() ? true : false,
    city: profile.city?.trim() ? true : false,
    state: profile.state?.trim() ? true : false,
    bio: profile.bio?.trim() ? true : false,
  };
  const completedCount = Object.values(completionChecks).filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / 11) * 100);

  return (
    <MemberDashboardShell
      userName={displayName}
      userEmail={user.email || ''}
      profileCompleted={profile.profile_completed}
    >
      {application?.status === 'approved' && application.member_id ? (
        <>
          <MembershipCard
            memberName={displayName}
            memberId={application.member_id}
            universityName={universityName}
            program={profile.program}
            status="Active Member"
            profilePhotoUrl={profile.profile_photo_url}
            issueDate={application.approved_at}
          />
          <MembershipStatusCard
            application={application}
            profileCompleted={profile.profile_completed}
            universityName={universityName}
            program={profile.program}
          />
        </>
      ) : (
        <MembershipStatusCard
          application={application}
          profileCompleted={profile.profile_completed}
          universityName={universityName}
          program={profile.program}
        />
      )}
    </MemberDashboardShell>
  );
}
