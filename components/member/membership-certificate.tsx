'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Printer, LoaderCircle } from 'lucide-react';
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
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  /**
   * Downloads through the same production API the plain link used to point at.
   *
   * A bare <a download> hands whatever the endpoint returns straight to the file
   * system, so a JSON error body was saved as a file named .pdf that no viewer
   * could open. Fetching first lets a failed response be reported as a readable
   * message, and confirms the body really is a PDF before it is offered to the
   * device. The endpoint and the renderer are unchanged; only error handling moved
   * to the client.
   */
  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setDownloadError('');

    try {
      const response = await fetch(
        `/api/certificate/${encodeURIComponent(memberId)}/pdf`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        // The route answers failures with JSON { error } and a matching status.
        const body = await response.json().catch(() => null);
        setDownloadError(
          (body && typeof body.error === 'string' && body.error) ||
            'The certificate could not be downloaded. Please try again shortly.'
        );
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/pdf')) {
        setDownloadError(
          'The server did not return a PDF. Please try again shortly.'
        );
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        setDownloadError(
          'The downloaded certificate was empty. Please try again shortly.'
        );
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `ASAM-Certificate-${memberId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Revoked on the next tick so Safari has time to start the download.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setDownloadError(
        'The certificate could not be downloaded. Check your connection and try again.'
      );
    } finally {
      setDownloading(false);
    }
  }

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
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            aria-busy={downloading}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {downloading ? 'Preparing PDF...' : 'Download Certificate'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print
          </button>
        </div>
        {downloadError && (
          <p
            role="alert"
            className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {downloadError}
          </p>
        )}
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
