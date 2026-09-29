import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { MembershipCertificate } from '@/components/member/membership-certificate';
import { getCertificateView } from '@/lib/member/certificate';
import { buildCertificateInnerHtml } from '@/lib/member/certificate-html';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Membership Certificate',
  description: 'Official electronic membership certificate issued by the Afghan Students Association in Malaysia.',
};

/**
 * Public certificate page. This is the URL encoded in the certificate QR code:
 * https://asam.org.my/certificate/{member_id}
 *
 * The data is read once through lib/member/certificate.ts, which prefers the
 * public RPC and falls back to the owner/admin-readable table read.
 */
export default async function CertificatePage({ params }: { params: { 'member-id': string } }) {
  const memberId = params['member-id'];
  // The certificate-specific logo copy is 46 KB, compared with 825 KB for the
  // full site logo, and the emblem is only displayed at 46 px.
  const result = await getCertificateView(memberId, { logoSrc: '/images/asam-logo-cert.png' });

  if (!result) notFound();

  const { record, view } = result;

  if (!record.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
        <div className="mx-auto mt-8 max-w-md px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <ShieldCheck className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Membership Not Active</h1>
            <p className="mt-2 text-sm text-gray-600">
              This membership certificate is not currently active. The membership may be pending review,
              rejected, or not yet approved.
            </p>
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="font-mono text-sm font-bold text-gray-900">{record.memberId}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-gray-400">
                Status: {record.status.replace('_', ' ')}
              </p>
            </div>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy/90"
            >
              Return to ASAM website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-2 flex max-w-[1123px] items-center justify-between px-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span>Official ASAM Credential</span>
        </div>
      </div>

      <MembershipCertificate html={buildCertificateInnerHtml(view)} memberId={record.memberId} />

      <div className="mx-auto mt-8 max-w-[1123px] px-4 text-center print:hidden">
        <p className="text-xs text-gray-400">
          This is an official electronic certificate issued by the Afghan Students Association in Malaysia.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Verify this certificate by scanning the QR code or visiting {view.verifyUrl}
        </p>
      </div>
    </div>
  );
}
