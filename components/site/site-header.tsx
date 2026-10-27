'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

import Link from 'next/link';

import { usePathname } from 'next/navigation';

import { Menu, X, ChevronDown, Search, ArrowRight } from 'lucide-react';

import { navItems } from '@/lib/data/navigation';

import { cn } from '@/lib/utils';

const searchablePages = Array.from(new Map(
  navItems.flatMap((item) => [
    { label: item.label, href: item.href, description: '' },
    ...(item.children ?? []),
  ]).map((item) => [item.href, item])
).values());

/** Logo is resolved on the server (root layout) so the header needs no client data fetch. */
export function SiteHeader({ logoUrl = '/logo-512.png' }: { logoUrl?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  const pathname = usePathname();
  const isPublicRoute = !/^\/(admin|member|auth)(\/|$)/.test(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('public-site', isPublicRoute);
    return () => document.body.classList.remove('public-site');
  }, [isPublicRoute]);

  useEffect(() => {
    if (!searchOpen) return;
    const trigger = searchTriggerRef.current;
    searchInputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      trigger?.focus();
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const trigger = menuTriggerRef.current;
    menuCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      trigger?.focus();
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [mobileOpen, searchOpen]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return searchablePages.slice(0, 6);
    return searchablePages.filter((page) => `${page.label} ${page.description}`.toLocaleLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <>
      {isPublicRoute && <a href="#main-content" className="sr-only z-[100] rounded-md bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-premium focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to main content</a>}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          'asam-site-header glass-nav border-b border-border/50',
          scrolled && 'shadow-premium'
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0"
              aria-label="ASAM Home"
            >
              <div className="relative h-11 w-11 overflow-hidden rounded-full lg:h-12 lg:w-12">
                <img
                  src={logoUrl}
                  alt="ASAM logo"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="asam-wordmark"><strong>ASAM<span>.</span></strong><small>AFGHAN STUDENTS · MALAYSIA</small></span>
            </Link>

            {/* Desktop Nav */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() =>
                    item.children && setOpenDropdown(item.label)
                  }
                  onMouseLeave={() => setOpenDropdown(null)}
                  onKeyDown={(event) => { if (event.key === 'Escape') { event.currentTarget.querySelector('button')?.focus(); setOpenDropdown(null); } }}
                  onFocusCapture={() => item.children && setOpenDropdown(item.label)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenDropdown(null);
                  }}
                >
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href || item.children?.some((child) => pathname === child.href.split('#')[0]) ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-1 px-2 xl:px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      item.children && 'pr-7 xl:pr-8',
                      (pathname === item.href || pathname.startsWith(`${item.href}/`) || item.children?.some((child) => pathname === child.href.split('#')[0] || pathname.startsWith(`${child.href.split('#')[0]}/`)))
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>

                  {item.children && <button
                    type="button"
                    aria-label={`${openDropdown === item.label ? 'Close' : 'Open'} ${item.label} menu`}
                    aria-expanded={openDropdown === item.label}
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-7 rounded-md text-muted-foreground hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  ><ChevronDown aria-hidden="true" className={cn('mx-auto h-3.5 w-3.5 transition-transform', openDropdown === item.label && 'rotate-180')} /></button>}

                  {item.children && openDropdown === item.label && (
                    <div
                      id={`nav-menu-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      aria-label={`${item.label} pages`}
                      className={cn(
                        'absolute top-full left-0 pt-2 animate-fade-down',
                        'w-[min(24rem,calc(100vw-2rem))]'
                      )}
                    >
                      <div
                        className={cn(
                          'glass-nav rounded-2xl border border-border/50 shadow-premium-lg p-3',
                          'max-h-[calc(100vh-7rem)] overflow-y-auto'
                        )}
                      >
                        <div className="grid gap-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                type="button"
                ref={searchTriggerRef}
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Search ASAM"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* PRIMARY JOIN ASAM CTA */}
              <Link
                href="/join-asam"
                className="hidden sm:inline-flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 text-sm font-semibold rounded-xl gradient-navy text-white shadow-premium hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-300"
              >
                Join ASAM
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                type="button"
                ref={menuTriggerRef}
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-secondary/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')).filter((element) => !element.hasAttribute('disabled'));
          const first = focusable[0]; const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}>
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          <div role="dialog" aria-modal="true" aria-label="Main navigation" className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-premium-lg animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <img
                    src={logoUrl}
                    alt="ASAM logo"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>

              <button
                type="button"
                ref={menuCloseRef}
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary/60"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav aria-label="Main navigation" className="p-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link href={item.href} onClick={() => setMobileOpen(false)} className="flex-1 block px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-secondary/60 transition-colors">{item.label}</Link>
                    {item.children && <button type="button" aria-label={`${openDropdown === `mobile-${item.label}` ? 'Collapse' : 'Expand'} ${item.label} pages`} aria-expanded={openDropdown === `mobile-${item.label}`} onClick={() => setOpenDropdown(openDropdown === `mobile-${item.label}` ? null : `mobile-${item.label}`)} className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ChevronDown aria-hidden="true" className={cn('mx-auto h-4 w-4 transition-transform', openDropdown === `mobile-${item.label}` && 'rotate-180')} /></button>}
                  </div>

                  {item.children && openDropdown === `mobile-${item.label}` && (
                    <div className="pl-4 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-secondary/40 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* MOBILE JOIN ASAM CTA */}
              <Link
                href="/join-asam"
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
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-4" onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('input, button, a[href]')).filter((element) => !element.hasAttribute('disabled'));
          const first = focusable[0]; const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}>
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSearchOpen(false)}
          />

          <div role="dialog" aria-modal="true" aria-labelledby="site-search-title" className="relative w-full max-w-2xl glass-nav rounded-2xl border border-border/50 shadow-premium-lg p-4 animate-scale-in">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <label id="site-search-title" htmlFor="site-search-input" className="sr-only">Search public pages</label>
              <input
                id="site-search-input"
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search public pages..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                aria-label="Search public pages"
                aria-controls="site-search-results"
                aria-describedby="site-search-help"
              />

              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="text-xs text-muted-foreground px-2 py-1 rounded border border-border hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Close
              </button>
            </div>

            <div className="py-3">
              <p id="site-search-help" className="text-xs text-muted-foreground mb-3">Find information by page title. Press Escape to close.</p>
              <div id="site-search-results" className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-live="polite">
                {searchResults.length ? searchResults.map((page) => (
                  <Link key={page.href} href={page.href} onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="rounded-lg px-3 py-2 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="block text-sm font-semibold">{page.label}</span>
                    {page.description && <span className="block mt-0.5 text-xs text-muted-foreground">{page.description}</span>}
                  </Link>
                )) : <p className="col-span-full px-3 py-4 text-sm text-muted-foreground" role="status">No public pages match “{searchQuery}”. Try another term.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
