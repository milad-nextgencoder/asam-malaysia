import { redirect } from 'next/navigation';
import { createClient } from './server';

const allowedAdminRoles = ['SUPER_ADMIN', 'EDITOR'];

export async function requireAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect('/admin/login?error=unauthenticated');
  }

  const { data: adminRole, error: roleError } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleError) {
    redirect('/admin/login?error=server-error');
  }

  if (!adminRole || !allowedAdminRoles.includes(adminRole.role)) {
    redirect('/admin/login?error=unauthorized');
  }

  return { role: adminRole.role };
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== 'SUPER_ADMIN') redirect('/admin?error=forbidden');
  return admin;
}
