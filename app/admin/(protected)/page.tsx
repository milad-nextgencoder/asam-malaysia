import { AdminDashboardOverview } from '@/components/admin/admin-dashboard-overview';
import type { DashboardCount, RecentActivityItem } from '@/lib/admin/dashboard-data';
import { getAdminDashboardData } from '@/lib/admin/dashboard-data';
import { createClient } from '@/lib/supabase/server';

const emptyCounts: DashboardCount[] = [
  'Published Events', 'Published News', 'Departments', 'Leadership',
  'Chapters', 'Universities', 'Opportunities', 'Gallery Albums',
].map((label) => ({ label, scope: 'Published', value: null, failed: true }));

export default async function AdminHomePage() {
  const supabase = createClient();
  const [claimsResult, userResult] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getUser(),
  ]);
  const userId = typeof claimsResult.data?.claims?.sub === 'string'
    ? claimsResult.data.claims.sub
    : '';

  let dashboardData = {
    counts: emptyCounts,
    countsFailed: true,
    recentActivity: [] as RecentActivityItem[],
    activityFailed: true,
    databaseOperational: false,
  };

  try {
    dashboardData = await getAdminDashboardData(supabase, userId);
  } catch {
    // Keep the dashboard available and show explicit unavailable states.
  }

  const user = userResult.data.user;
  const userName = [user?.user_metadata?.full_name, user?.user_metadata?.name]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
    ?.trim() ?? user?.email ?? 'Administrator';

  return (
    <AdminDashboardOverview
      adminName={userName}
      counts={dashboardData.counts}
      countsFailed={dashboardData.countsFailed}
      recentActivity={dashboardData.recentActivity}
      activityFailed={dashboardData.activityFailed}
      databaseOperational={dashboardData.databaseOperational}
      authenticationOperational={!userResult.error && Boolean(user)}
      authorizationOperational={!claimsResult.error && Boolean(userId)}
    />
  );
}
