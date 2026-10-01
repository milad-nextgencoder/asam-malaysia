'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, Home, Camera, CreditCard, Calendar, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/member/actions/auth';

interface MemberDashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  profileCompleted: boolean;
}

export function MemberDashboardShell({ children, userName, userEmail, profileCompleted }: MemberDashboardShellProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/member', label: 'Dashboard', icon: Home },
    { href: '/member/membership', label: 'Membership', icon: CreditCard },
    { href: '/member/profile', label: 'Profile', icon: User },
    { href: '/member/events', label: 'Events', icon: Calendar },
    { href: '/member/notifications', label: 'Notifications', icon: Bell },
    { href: '/member/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-lg font-bold text-navy">
              ASAM
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">Member Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-foreground">{userName}</div>
              <div className="text-xs text-muted-foreground">{userEmail}</div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/*
          The nav wraps to a second row on narrow screens instead of forcing a
          horizontal scroll. min-w-[85px] x 6 overflowed a 320px viewport, so the
          floor is lowered on the smallest screens and the row is allowed to wrap.
        */}
        <nav className="mb-8 flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-w-[71px] sm:min-w-[85px]',
                  isActive
                    ? 'bg-navy text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {/* The label is visually hidden on mobile but exposed to screen
                    readers, so the tab is never an unlabelled icon. */}
                <span className="sr-only sm:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {!profileCompleted && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Camera className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Complete your profile</p>
                <p className="mt-1 text-sm text-amber-700">
                  Add your details to personalize your ASAM member experience.
                </p>
                <Link
                  href="/member/profile"
                  className="mt-2 inline-flex text-sm font-semibold text-amber-900 underline hover:text-amber-700"
                >
                  Complete profile
                </Link>
              </div>
            </div>
          </div>
        )}

        <main>{children}</main>
      </div>
    </div>
  );
}
