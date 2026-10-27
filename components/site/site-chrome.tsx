'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Public navigation never overlaps the separate member and administrator workspaces. */
export function SiteChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const workspace = /^\/(admin|member|auth)(\/|$)/.test(pathname);
  return <>{!workspace && header}<main id="main-content" className={workspace || /^\/certificate(\/|$)/.test(pathname) ? 'flex-1' : 'flex-1 asam-public'}>{children}</main>{!workspace && footer}</>;
}
