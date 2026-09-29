import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { AdminApplicationsList } from '@/components/admin/admin-applications-list';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Membership Applications' };

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const supabase = createClient();

  const [{ data: applications, error }, { data: members }] = await Promise.all([
    supabase
      .from('membership_applications')
      .select('id, user_id, status, member_id, rejection_reason, application_submitted_at, reviewed_at, reviewed_by, approved_at, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('member_profiles')
      .select('user_id, first_name, last_name, preferred_name, email, university_id, program, profile_photo_url'),
  ]);

  if (error) {
    redirect('/admin?error=applications-load-failed');
  }

  // Merge member data into applications
  const memberMap = new Map(
    (members ?? []).map((m) => [m.user_id, m])
  );

  const applicationsWithMembers = (applications ?? []).map((app) => ({
    ...app,
    member: memberMap.get(app.user_id) ?? null,
  }));

  return <AdminApplicationsList applications={applicationsWithMembers} />;
}
