import type { SupabaseClient } from '@supabase/supabase-js';

export interface DashboardCount {
  label: string;
  value: number | null;
  failed: boolean;
  scope: string;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  content: string;
  administrator: string;
  createdAt: string;
}

function countResult(
  label: string,
  scope: string,
  result: { count: number | null; error: { message: string } | null }
): DashboardCount {
  return {
    label,
    scope,
    value: result.error ? null : result.count ?? 0,
    failed: Boolean(result.error),
  };
}

function getMetadataText(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function getAdminDashboardData(
  supabase: SupabaseClient,
  currentUserId: string
) {
  const [
    events,
    news,
    departments,
    leadership,
    chapters,
    universities,
    opportunities,
    galleryAlbums,
    settingsCheck,
    auditResult,
    members,
    pendingApplications,
    approvedMembers,
  ] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('news').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('departments').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('leadership').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('chapters').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('universities').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('opportunities').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('gallery_albums').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('site_settings').select('id', { count: 'exact', head: true }).limit(1),
    supabase
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, actor_user_id, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('member_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('membership_applications').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
    supabase.from('membership_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
  ]);

  const counts = [
    countResult('Total Members', 'All', members),
    countResult('Pending Applications', 'Submitted/Review', pendingApplications),
    countResult('Approved Members', 'Approved', approvedMembers),
    countResult('Published Events', 'Published', events),
    countResult('Published News', 'Published', news),
    countResult('Departments', 'Published', departments),
    countResult('Leadership', 'Published', leadership),
    countResult('Chapters', 'Active', chapters),
    countResult('Universities', 'Published', universities),
    countResult('Opportunities', 'Published', opportunities),
    countResult('Gallery Albums', 'Published', galleryAlbums),
  ];

  const recentActivity: RecentActivityItem[] = auditResult.error
    ? []
    : (auditResult.data ?? []).map((entry) => {
        const title = getMetadataText(entry.metadata, 'title')
          ?? getMetadataText(entry.metadata, 'name');
        const idSuffix = entry.entity_id ? ` · ${entry.entity_id.slice(0, 8)}` : '';

        return {
          id: entry.id,
          action: entry.action,
          content: title ?? `${entry.entity_type}${idSuffix}`,
          administrator: entry.actor_user_id === currentUserId
            ? 'You'
            : entry.actor_user_id
              ? 'Administrator'
              : 'System',
          createdAt: entry.created_at,
        };
      });

  return {
    counts,
    countsFailed: counts.some((count) => count.failed),
    recentActivity,
    activityFailed: Boolean(auditResult.error),
    databaseOperational: !settingsCheck.error,
  };
}
