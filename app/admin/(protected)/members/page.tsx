import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { AdminMemberList } from '@/components/admin/admin-member-list';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Members' };

export default async function AdminMembersPage() {
  await requireAdmin();
  const supabase = createClient();

  const [{ data: members, error }, { data: applications }] = await Promise.all([
    supabase
      .from('member_profiles')
      .select('id, user_id, first_name, last_name, preferred_name, email, phone, university_id, program, faculty, city, state, profile_completed, profile_photo_url, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('membership_applications')
      .select('user_id, status, member_id'),
  ]);

  if (error) {
    redirect('/admin?error=members-load-failed');
  }

  // Merge membership data into member records
  const applicationMap = new Map(
    (applications ?? []).map((app) => [app.user_id, app])
  );

  const membersWithStatus = (members ?? []).map((member) => {
    const app = applicationMap.get(member.user_id);
    return {
      ...member,
      membership_status: app?.status ?? 'draft',
      member_id: app?.member_id ?? null,
    };
  });

  return <AdminMemberList members={membersWithStatus} />;
}
