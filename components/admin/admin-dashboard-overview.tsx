'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  FileText,
  GraduationCap,
  Images,
  Network,
  Newspaper,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardCount, RecentActivityItem } from '@/lib/admin/dashboard-data';
import { dashboardQuickActions } from '@/lib/admin/modules';

interface AdminDashboardOverviewProps {
  adminName: string;
  counts: DashboardCount[];
  countsFailed: boolean;
  recentActivity: RecentActivityItem[];
  activityFailed: boolean;
  databaseOperational: boolean;
  authenticationOperational: boolean;
  authorizationOperational: boolean;
}

const countIcons: Record<string, LucideIcon> = {
  'Published Events': CalendarDays,
  'Published News': Newspaper,
  Departments: Building2,
  Leadership: UsersRound,
  Chapters: Network,
  Universities: GraduationCap,
  Opportunities: BriefcaseBusiness,
  'Gallery Albums': Images,
};

const actionIcons: Record<string, LucideIcon> = {
  'Create Event': CalendarDays,
  'Create News Article': Newspaper,
  'Add Leadership Member': UsersRound,
  'Add Chapter': Building2,
  'Add University': GraduationCap,
  'Upload Gallery': Images,
  'Add Opportunity': BriefcaseBusiness,
};

const statusLabels = {
  database: 'Supabase Connection',
  authentication: 'Authentication',
  authorization: 'Admin Authorization',
} as const;

function StatusRow({ label, operational }: { label: string; operational: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 py-3 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={operational ? 'inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700' : 'inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700'}>
        <span className={operational ? 'h-1.5 w-1.5 rounded-full bg-emerald-600' : 'h-1.5 w-1.5 rounded-full bg-amber-500'} />
        {operational ? 'Operational' : 'Requires attention'}
      </span>
    </div>
  );
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date) + ' UTC';
}

export function AdminDashboardOverview({
  adminName,
  counts,
  countsFailed,
  recentActivity,
  activityFailed,
  databaseOperational,
  authenticationOperational,
  authorizationOperational,
}: AdminDashboardOverviewProps) {
  const statuses = [
    { key: 'database', operational: databaseOperational },
    { key: 'authentication', operational: authenticationOperational },
    { key: 'authorization', operational: authorizationOperational },
  ] as const;

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="overflow-hidden rounded-lg border border-[#233448] bg-[#142236] text-white shadow-premium">
        <div className="grid gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-9">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d7bd7b]">
              <span className="h-px w-6 bg-[#d7bd7b]" /> ASAM Administration
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome to ASAM Administration
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
              Manage the Afghan Students Association of Malaysia public digital platform.
            </p>
          </div>
          <div className="border-l-2 border-[#c8ad68] pl-4 lg:min-w-52">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-white/45">Signed in as</div>
            <div className="mt-1 truncate text-sm font-semibold text-white">{adminName}</div>
          </div>
        </div>
      </section>

      <section aria-labelledby="dashboard-overview-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Website overview</p>
            <h2 id="dashboard-overview-title" className="mt-1 text-sm font-semibold text-foreground">Public content at a glance</h2>
          </div>
          {countsFailed && (
            <span className="hidden items-center gap-1.5 text-[11px] text-amber-700 sm:inline-flex">
              <CircleAlert className="h-3.5 w-3.5" /> Some counts could not be loaded
            </span>
          )}
        </div>
        {countsFailed && (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:hidden" role="status">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Some counts could not be loaded from the database.
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4 xl:gap-4">
          {counts.map((count) => {
            const Icon = countIcons[count.label] ?? BookOpenText;
            return (
              <article key={count.label} className="min-w-0 rounded-lg border border-[#e3e5e8] bg-white p-4 shadow-sm transition-shadow hover:shadow-premium sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-muted-foreground">{count.label}</p>
                    <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-[#172436]">
                      {count.value === null ? '—' : count.value.toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#ece7d9] bg-[#faf8f2] text-[#9a7c36]">
                    <Icon className="h-[17px] w-[17px]" />
                  </div>
                </div>
                <div className="mt-3 border-t border-[#eef0f2] pt-2 text-[10px] text-muted-foreground">
                  {count.failed ? 'Unavailable' : count.scope}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <section className="min-w-0 rounded-lg border border-[#e3e5e8] bg-white shadow-sm" aria-labelledby="recent-activity-title">
          <div className="flex items-center justify-between border-b border-[#eceef0] px-4 py-4 sm:px-5">
            <div>
              <h2 id="recent-activity-title" className="text-sm font-semibold text-[#172436]">Recent Activity</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">Latest recorded admin actions</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          {activityFailed ? (
            <div className="m-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-900" role="status">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Recent activity could not be loaded.
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex min-h-36 flex-col items-center justify-center px-4 py-8 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f2eb] text-[#8a7440]">
                <FileText className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs font-semibold text-[#273549]">No recent activity.</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Admin actions will appear here when recorded.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#eef0f2] px-4 sm:px-5">
              <div className="hidden grid-cols-[minmax(110px,0.8fr)_minmax(120px,1fr)_minmax(100px,0.7fr)_auto] gap-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                <span>Action</span><span>Content</span><span>Administrator</span><span>Time (UTC)</span>
              </div>
              {recentActivity.map((item) => (
                <div key={item.id} className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 py-3 md:grid-cols-[minmax(110px,0.8fr)_minmax(120px,1fr)_minmax(100px,0.7fr)_auto] md:items-center">
                  <span className="min-w-0 truncate text-xs font-medium text-[#26364a]">{item.action}</span>
                  <span className="min-w-0 truncate text-xs text-muted-foreground" title={item.content}>{item.content}</span>
                  <span className="col-span-1 text-[11px] text-muted-foreground md:col-span-1">{item.administrator}</span>
                  <time className="col-span-1 text-right text-[10px] text-muted-foreground md:text-left" dateTime={item.createdAt}>
                    {formatActivityTime(item.createdAt)}
                  </time>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-lg border border-[#e3e5e8] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="system-status-title">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="system-status-title" className="text-sm font-semibold text-[#172436]">System Status</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">Verified for this session</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-[#8a7440]" />
            </div>
            <div className="mt-2">
              {statuses.map(({ key, operational }) => (
                <StatusRow key={key} label={statusLabels[key]} operational={operational} />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#e3e5e8] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="quick-actions-title">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 id="quick-actions-title" className="text-sm font-semibold text-[#172436]">Quick Actions</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">Open a module placeholder</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="divide-y divide-[#eef0f2]">
              {dashboardQuickActions.map((action) => {
                const Icon = actionIcons[action.label] ?? Award;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex min-w-0 items-center gap-3 py-2.5 text-xs font-medium text-[#2c3a4b] transition-colors hover:text-[#8a6b26]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f6f3ea] text-[#8a7440] transition-colors group-hover:bg-[#eee8d6]">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{action.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a5aab1] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
