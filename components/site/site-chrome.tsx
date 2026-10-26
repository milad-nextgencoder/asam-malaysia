'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Public navigation never overlaps the separate member and administrator workspaces. */
export function SiteChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const workspace = /^\/(admin|member|auth)(\/|$)/.test(pathname);
  return <>{!workspace && header}<main id="main-content" className="flex-1">{children}</main>{!workspace && footer}</>;
}
