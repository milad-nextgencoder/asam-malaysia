import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { AdminMemberList } from '@/components/admin/admin-member-list';
import { DirectoryPagination } from '@/components/admin/directory-pagination';
import { ADMIN_PAGE_SIZE, readDirectoryParams } from '@/lib/admin/pagination';

export const metadata = { title: 'Members' };
export default async function DirectoryPage({ searchParams: searchParamsPromise }: { searchParams?: Promise<Record<string,string|string[]|undefined>> }) {
  const searchParams = await searchParamsPromise || {};
  await requireAdmin();
  const { page,q,status,offset } = readDirectoryParams(searchParams);
  const { data,error } = await (await createClient()).rpc('get_admin_directory', { p_kind: 'members',p_query:q,p_status:status,p_offset:offset,p_limit:ADMIN_PAGE_SIZE });
  if (error) { console.error('Admin directory unavailable', { code: error.code }); throw new Error('The directory could not be loaded. Please try again.'); }
  const total = Number(data?.[0]?.total_count || 0);
  return <><AdminMemberList members={(data || []).map((row: { record: any }) => row.record)} query={q} status={status} />
    <DirectoryPagination base="/admin/members" page={page} total={total} query={q} status={status} /></>;
}
