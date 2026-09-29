'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import {
  CERTIFICATE_CSS,
  CERTIFICATE_HEIGHT_PX,
  CERTIFICATE_WIDTH_PX,
} from '@/lib/member/certificate-html';

/**
 * Print rules for the website only. The PDF document defines its own page size,
 * so these live here rather than in the shared stylesheet.
 */
const CERTIFICATE_PRINT_CSS = `
@page { size: A4 landscape; margin: 0; }
@media print {
  body > header, body > footer { display: none !important; }
  body { background: #ffffff !important; }
  main { padding: 0 !important; }
  .cert-actions { display: none !important; }
  .asam-certificate-frame { height: auto !important; max-width: none !important; }
  .asam-certificate-scaler { position: static !important; transform: none !important; }
  .asam-certificate-root { margin: 0 !important; padding: 0 !important; }
}
`;

interface MembershipCertificateProps {
  /** Exactly the markup used by the PDF renderer (lib/member/certificate-html.ts). */
  html: string;
  memberId: string;
}

/**
 * Website preview of the membership certificate.
 *
 * The markup is the shared certificate artifact scaled to the available width,
 * so the on-screen composition is the same composition the PDF produces. The
 * previous version re-implemented the certificate in React/Tailwind with its own
 * flex centring, which is why the preview and the PDF never matched.
 */
export function MembershipCertificate({ html, memberId }: MembershipCertificateProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const updateScale = () => {
      const available = element.clientWidth;
      if (available > 0) {
        setScale(Math.min(1, available / CERTIFICATE_WIDTH_PX));
      }
    };

    updateScale();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="asam-certificate-root mx-auto w-full max-w-[1123px] px-4 print:px-0">
      <style dangerouslySetInnerHTML={{ __html: CERTIFICATE_CSS + CERTIFICATE_PRINT_CSS }} />

      <div className="cert-actions mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Official Electronic Certificate</h2>
          <p className="mt-1 text-sm text-gray-500">
            Your verified ASAM membership certificate with QR verification code.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/api/certificate/${encodeURIComponent(memberId)}/pdf`}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy/90"
          >
            <Download className="h-4 w-4" />
            Download Certificate
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div
        ref={frameRef}
        className="asam-certificate-frame relative mx-auto w-full"
        style={{ maxWidth: CERTIFICATE_WIDTH_PX, height: CERTIFICATE_HEIGHT_PX * scale }}
      >
        <div
          className="asam-certificate-scaler absolute left-0 top-0 origin-top-left"
          style={{
            width: CERTIFICATE_WIDTH_PX,
            height: CERTIFICATE_HEIGHT_PX,
            transform: `scale(${scale})`,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
