import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { AdminMemberDetail } from '@/components/admin/admin-member-detail';
import { notFound } from 'next/navigation';

export default async function AdminMemberDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const supabase = createClient();

  const { data: member, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('user_id', params.id)
    .maybeSingle();

  if (error || !member) {
    notFound();
  }

  const { data: application } = await supabase
    .from('membership_applications')
    .select('*')
    .eq('user_id', params.id)
    .maybeSingle();

  const { data: university } = member.university_id
    ? await supabase.from('universities').select('id, name, city, state').eq('id', member.university_id).maybeSingle()
    : { data: null };

  return <AdminMemberDetail member={member} application={application} universityName={university?.name ?? null} />;
}
