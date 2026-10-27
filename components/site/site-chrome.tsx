'use client';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

/** Public navigation never overlaps the separate member and administrator workspaces. */
export function SiteChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const workspace = /^\/(admin|member|auth)(\/|$)/.test(pathname);
  useEffect(() => {
    if (workspace || pathname.startsWith('/certificate')) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('asam-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    const targets = document.querySelectorAll('#main-content .asam-section-header, #main-content a.group, #main-content .asam-cta-panel');
    targets.forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); targets.forEach((element) => element.classList.remove('asam-revealed')); };
  }, [pathname, workspace]);
  return <>{!workspace && header}<main id="main-content" className={workspace || /^\/certificate(\/|$)/.test(pathname) ? (workspace ? 'flex-1 asam-workspace' : 'flex-1') : 'flex-1 asam-public'}>{children}</main>{!workspace && footer}</>;
}
