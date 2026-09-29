import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/member/helpers';
import { ensureMemberProfile, getPublishedUniversities } from '@/lib/member/profile';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MemberProfileForm } from '@/components/member/member-profile-form';
import { redirect } from 'next/navigation';

export default async function MemberProfilePage() {
  const { userId } = await requireMember();
  const supabase = createClient();

  const [{ data: userData }, universities] = await Promise.all([
    supabase.auth.getUser(),
    getPublishedUniversities(),
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal information and profile photo.
        </p>
        <div className="mt-8">
          <MemberProfileForm profile={profile} universities={universities} />
        </div>
      </div>
    </MemberDashboardShell>
  );
}
