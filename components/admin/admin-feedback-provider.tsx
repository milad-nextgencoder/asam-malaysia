'use client';

import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';

/**
 * Mounts the admin notification outlet.
 *
 * The project already ships the `sonner` Toaster (components/ui/sonner.tsx) but it
 * was never rendered, so admin save actions produced no visible confirmation. It
 * is mounted here, inside the protected admin layout, so the public website is
 * unaffected. `richColors` and a mobile-safe position make success/failure
 * legible on small screens, and `closeButton` lets a message be dismissed.
 */
export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={4000}
        toastOptions={{ className: 'text-sm' }}
      />
    </>
  );
}