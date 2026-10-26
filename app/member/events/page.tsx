import { createClient } from '@/lib/supabase/server';
import { requireMember, getMemberAuth } from '@/lib/member/helpers';
import { ensureMemberProfile } from '@/lib/member/profile';
import { MemberDashboardShell } from '@/components/member/member-dashboard-shell';
import { MemberEventsList } from '@/components/member/member-events-list';
import { redirect } from 'next/navigation';

export default async function MemberEventsPage() {
  const { userId } = await requireMember();
  const supabase = await createClient();

  const { data: userData } = await getMemberAuth();
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

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, title, description, date, time, location, category, featured_image_url, registration_url')
    .eq('status', 'published')
    .order('date', { ascending: true, nullsFirst: false });

  const { data: registrations, error: registrationError } = await supabase
    .from('event_registrations')
    .select('event_id, status, registered_at')
    .eq('user_id', userId);

  if (eventsError || registrationError) throw new Error('Your events could not be loaded. Please try again.');
  const registeredEventIds = new Set((registrations ?? []).map((r) => r.event_id));

  return (
    <MemberDashboardShell
      userName={displayName}
      userEmail={user.email || ''}
      profileCompleted={profile.profile_completed}
    >
      <MemberEventsList events={events ?? []} registeredEventIds={registeredEventIds} />
    </MemberDashboardShell>
  );
}
