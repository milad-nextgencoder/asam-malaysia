import type { ReactElement, ReactNode } from 'react';
import { AdminDashboardShell } from '@/components/admin/admin-dashboard-shell';
import { AdminFeedbackProvider } from '@/components/admin/admin-feedback-provider';
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
    // Mounts the existing sonner Toaster inside the admin area only, so save
    // feedback is visible on every admin screen without adding a second
    // notification framework or changing the public site's bundle.
    <AdminFeedbackProvider>
      <AdminDashboardShell
        admin={{
          name: fullName ?? user?.email ?? 'Administrator',
          email: user?.email ?? '',
          role,
        }}
      >
        {children}
      </AdminDashboardShell>
    </AdminFeedbackProvider>
  );
}
