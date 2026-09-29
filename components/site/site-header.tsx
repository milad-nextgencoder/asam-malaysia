'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Search, ArrowRight } from 'lucide-react';
import { navItems } from '@/lib/data/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    void createClient().from('site_settings').select('logo_url').eq('singleton', true).maybeSingle().then(({ data }) => {
      if (active && data?.logo_url && /^https:\/\//i.test(data.logo_url)) setLogoUrl(data.logo_url);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          'glass-nav border-b border-border/50',
          scrolled && 'shadow-premium'
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group" aria-label="ASAM Home">
              <div className="relative h-12 w-12 overflow-hidden rounded-full lg:h-16 lg:w-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="ASAM logo" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      pathname.startsWith(item.href)
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openDropdown === item.label && 'rotate-180')} />
                    )}
                  </Link>
                  {item.children && openDropdown === item.label && (
                    <div className={cn(
                      'absolute top-full left-0 pt-2 animate-fade-down',
                      item.label === 'Departments' ? 'w-[min(42rem,calc(100vw-2rem))]' : 'w-80'
                    )}>
                      <div className={cn(
                        'glass-nav rounded-2xl border border-border/50 shadow-premium-lg p-3',
                        item.label === 'Departments' && 'max-h-[calc(100vh-7rem)] overflow-y-auto'
                      )}>
                        <div className={cn('grid gap-1', item.label === 'Departments' && 'grid-cols-2')}>
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                'group flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-all duration-200',
                                item.label === 'Departments' && child.label === 'All Departments' && 'col-span-2'
                              )}
                            >
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-foreground group-hover:text-gold-dark transition-colors">
                                  {child.label}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {child.description}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                aria-label="Search ASAM"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/membership"
                className="hidden sm:inline-flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 text-sm font-semibold rounded-xl gradient-navy text-white shadow-premium hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300"
              >
                Join ASAM
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-secondary/60 transition-all"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-premium-lg animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="ASAM logo" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary/60"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  <Link
                    href={item.href}
                    className="block px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-secondary/60 transition-colors"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-4 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-secondary/40 hover:text-foreground transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/membership"
                className="flex items-center justify-center gap-2 mt-4 px-4 py-3 text-sm font-semibold rounded-xl gradient-navy text-white shadow-premium"
              >
                Join ASAM
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl glass-nav rounded-2xl border border-border/50 shadow-premium-lg p-4 animate-scale-in">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ASAM — people, universities, events, articles..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-muted-foreground px-2 py-1 rounded border border-border hover:bg-secondary/60"
              >
                ESC
              </button>
            </div>
            <div className="py-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Quick Links
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Leadership', href: '/leadership' },
                  { label: 'Departments', href: '/departments' },
                  { label: 'Events', href: '/events' },
                  { label: 'Membership', href: '/membership' },
                  { label: 'Universities', href: '/universities' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSearchOpen(false)}
                    className="px-3 py-2 text-sm rounded-lg hover:bg-secondary/60 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
