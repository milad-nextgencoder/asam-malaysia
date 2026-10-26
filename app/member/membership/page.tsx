import { createClient } from '@/lib/supabase/server';
import { requireMember, getMemberAuth } from '@/lib/member/helpers';
import { ensureMemberProfile } from '@/lib/member/profile';
import { getMembershipApplication } from '@/lib/member/membership';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MembershipStatusCard } from '@/components/member/membership-status';
import { MembershipCard } from '@/components/member/membership-card';
import { getCertificateRecord } from '@/lib/member/certificate';
import { ProfileCompletion } from '@/components/member/profile-completion';
import { redirect } from 'next/navigation';

export default async function MemberMembershipPage() {
  const { userId } = await requireMember();
  const supabase = await createClient();

  const [{ data: userData }, application] = await Promise.all([
    getMemberAuth(),
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

  const { data: university } = profile.university_id
    ? await supabase.from('universities').select('name').eq('id',profile.university_id).maybeSingle()
    : { data: null };
  const universityName = university?.name || null;
  const certificate = application?.status === "approved" && application.member_id ? await getCertificateRecord(application.member_id) : null;


  return (
    <MemberDashboardShell
      userName={displayName}
      userEmail={user.email || ''}
      profileCompleted={profile.profile_completed}
    >
      <ProfileCompletion profile={profile} />
      {application?.status === 'approved' && application.member_id ? (
        <>
          <MembershipCard
            memberName={certificate?.memberName || displayName}
            memberId={application.member_id}
            universityName={certificate?.university || universityName}
            program={certificate?.program || profile.program}
            status="Active Member"
            profilePhotoUrl={profile.profile_photo_url}
            issueDate={application.approved_at}
          />
          <MembershipStatusCard
            application={application}
            profileCompleted={profile.profile_completed}
            universityName={certificate?.university || universityName}
            program={certificate?.program || profile.program}
          />
        </>
      ) : (
        <MembershipStatusCard
          application={application}
          profileCompleted={profile.profile_completed}
          universityName={certificate?.university || universityName}
          program={certificate?.program || profile.program}
        />
      )}
    </MemberDashboardShell>
  );
}
