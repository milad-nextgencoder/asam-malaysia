import type { ReactElement, ReactNode } from 'react';
import { AdminDashboardShell } from '@/components/admin/admin-dashboard-shell';
import { requireAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const { role } = await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const fullName = [user?.user_metadata?.full_name, user?.user_metadata?.name]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
    ?.trim();

  return (
    <AdminDashboardShell
      admin={{
        name: fullName ?? user?.email ?? 'Administrator',
        email: user?.email ?? '',
        role,
      }}
    >
      {children}
    </AdminDashboardShell>
  );
}
