'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Award,
  BookOpen,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarPlus2,
  ChevronDown,
  CircleHelp,
  Files,
  GraduationCap,
  Handshake,
  House,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Network,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  UserRoundPlus,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminNavigation } from '@/lib/admin/modules';

interface AdminIdentity {
  name: string;
  email: string;
  role: string;
}

interface AdminDashboardShellProps {
  admin: AdminIdentity;
  children: React.ReactNode;
}

const navigationIcons: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'panels-top-left': PanelsTopLeft,
  'book-open': BookOpen,
  'users-round': UsersRound,
  'building-2': Building2,
  network: Network,
  'graduation-cap': GraduationCap,
  'calendar-days': CalendarDays,
  'briefcase-business': BriefcaseBusiness,
  award: Award,
  images: Images,
  files: Files,
  newspaper: Newspaper,
  'circle-help': CircleHelp,
  'messages-square': MessagesSquare,
  handshake: Handshake,
  'settings-2': Settings2,
  'scroll-text': ScrollText,
  'shield-check': ShieldCheck,
};

function isActivePath(pathname: string, href: string) {
  return href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminDashboardShell({ admin, children }: AdminDashboardShellProps) {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const activeItem = adminNavigation.flatMap((group) => group.items).find((item) => isActivePath(pathname, item.href));
  const pageTitle = activeItem?.label ?? 'Dashboard';
  const initials = admin.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-foreground">
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-[2px] lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#101b2b] text-white shadow-premium-lg transition-[width,transform] duration-200',
          compact ? 'w-[65px]' : 'w-[231px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('flex h-[65px] shrink-0 items-center border-b border-white/10', compact ? 'justify-center px-3' : 'gap-3 px-5')}>
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/25 bg-white">
            <Image src="/logo.png" alt="ASAM logo" fill sizes="40px" className="object-cover" priority />
          </div>
          {!compact && (
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-bold leading-none">ASAM</div>
              <div className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Administration
              </div>
            </div>
          )}
          <button
            type="button"
            className="ml-auto hidden h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:flex"
            aria-label={compact ? 'Expand sidebar' : 'Collapse sidebar'}
            title={compact ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCompact((value) => !value)}
          >
            {compact ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
          {adminNavigation.filter((group) => admin.role === 'SUPER_ADMIN' || !['System'].includes(group.label)).map((group) => (
            <div key={group.label}>
              {!compact && (
                <h2 className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                  {group.label}
                </h2>
              )}
              <div className="space-y-1">
                {group.items.filter((item) => admin.role === 'SUPER_ADMIN' || item.href !== '/admin/settings').map((item) => {
                  const Icon = navigationIcons[item.icon] ?? House;
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={compact ? item.label : undefined}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'group flex min-h-10 items-center rounded-md text-[11px] font-medium transition-colors',
                        compact ? 'justify-center px-2' : 'gap-3 px-3',
                        active
                          ? 'bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10'
                          : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                      )}
                    >
                      <Icon className={cn('h-[14px] w-[14px] shrink-0', active && 'text-[#d6b66c]')} />
                      {!compact && <span className="truncate">{item.label}</span>}
                      {active && !compact && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d6b66c]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn('shrink-0 border-t border-white/10 py-4', compact ? 'px-2 text-center' : 'px-5')}>
          {compact ? (
            <span className="text-[9px] font-semibold uppercase tracking-widest text-white/40" title="Afghan Students Association of Malaysia">ASAM</span>
          ) : (
            <div className="text-[9px] leading-relaxed text-white/45">
              <div className="font-semibold uppercase tracking-wider text-white/60">Afghan Students Association</div>
              <div>of Malaysia</div>
            </div>
          )}
        </div>
      </aside>

      <div className={cn('min-h-screen transition-[padding] duration-200', compact ? 'lg:pl-[76px]' : 'lg:pl-[272px]')}>
        <header className="sticky top-0 z-30 flex min-h-[65px] items-center justify-between gap-4 border-b border-[#e5e7eb] bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-foreground hover:bg-secondary lg:hidden"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">ASAM Admin</div>
              <h1 className="truncate text-sm font-semibold text-navy sm:text-base">{pageTitle}</h1>
            </div>
          </div>

          <div className="hidden w-full max-w-sm items-center md:flex">
            <label className="relative w-full" aria-label="Dashboard search placeholder">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search dashboard"
                readOnly
                className="h-9 w-full rounded-md border border-border bg-[#f8f8f7] pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                title="Search is not configured yet"
              />
            </label>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled
              aria-label="Notifications not configured"
              title="Notifications are not configured yet"
              className="relative flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-md text-muted-foreground opacity-60"
            >
              <Bell className="h-[15px] w-[15px]" />
            </button>
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-md p-1.5 text-left hover:bg-secondary/70"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((value) => !value)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8c694] bg-[#f4efdf] text-xs font-bold text-navy">
                  {initials}
                </span>
                <span className="hidden max-w-[119px] sm:block">
                  <span className="block truncate text-xs font-semibold text-foreground">{admin.name}</span>
                  <span className="block truncate text-[9px] uppercase tracking-wide text-muted-foreground">{admin.role.replaceAll('_', ' ')}</span>
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-border bg-white p-2 shadow-premium-lg" role="menu">
                  <div className="border-b border-border px-3 py-2">
                    <div className="truncate text-xs font-semibold">{admin.name}</div>
                    <div className="truncate text-[9px] text-muted-foreground">{admin.email}</div>
                  </div>
                  {admin.role === 'SUPER_ADMIN' && <Link
                    href="/admin/users"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground hover:bg-secondary"
                  >
                    <UsersRound className="h-4 w-4 text-muted-foreground" />
                    My Admin Profile
                  </Link>}
                  {admin.role === 'SUPER_ADMIN' && <Link
                    href="/admin/settings"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground hover:bg-secondary"
                  >
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>}
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1360px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
