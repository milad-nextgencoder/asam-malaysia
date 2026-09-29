import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, XCircle, GraduationCap, Calendar, ShieldCheck, Award } from 'lucide-react';
import { getCertificateRecord } from '@/lib/member/certificate';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Membership Verification',
  description: 'Verify an ASAM membership record using an official Member ID.',
};

/**
 * Membership verification result.
 *
 * Reads through lib/member/certificate.ts so anonymous verification works once
 * supabase/migrations/20260930010000_certificate_public_verification.sql is
 * applied, and keeps working for the owner/admin before that. The member photo is
 * intentionally not shown here: the public verification record is limited to the
 * fields needed to confirm a membership.
 */
export default async function VerifyMemberPage({ params }: { params: { 'member-id': string } }) {
  const memberId = params['member-id'];
  const record = await getCertificateRecord(memberId);

  if (!record) notFound();

  const isActive = record.isApproved;
  const initials =
    record.memberName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/5">
            <ShieldCheck className="h-8 w-8 text-navy" />
          </div>
          <h1 className="font-display text-2xl font-bold text-navy">ASAM</h1>
          <p className="mt-1 text-sm text-gray-500">Membership Verification</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className={`px-6 py-4 ${isActive ? 'bg-green-600' : 'bg-red-600'}`}>
            <div className="flex items-center gap-3">
              {isActive ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                <XCircle className="h-6 w-6 text-white" />
              )}
              <div>
                <p className="font-semibold text-white">
                  {isActive ? 'Valid Membership' : 'Membership Not Active'}
                </p>
                <p className="text-xs text-white/80">
                  {isActive ? 'This is an active ASAM member.' : 'This membership is not currently active.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
                <span className="font-display text-xl font-bold text-navy">{initials}</span>
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg font-bold text-gray-900">{record.memberName}</h2>
                <p className="font-mono text-sm font-semibold text-navy">{record.memberId}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{record.university}</span>
                {record.program !== '\u2014' && <span className="text-gray-400">· {record.program}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {record.approvedAt
                    ? `Approved ${new Date(record.approvedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : '\u2014'}
                </span>
              </div>
            </div>

            {isActive && (
              <div className="mt-5 border-t border-gray-100 pt-4">
                <Link
                  href={`/certificate/${encodeURIComponent(record.memberId)}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <Award className="h-4 w-4" />
                  View membership certificate
                </Link>
              </div>
            )}

            <div className="mt-5 border-t border-gray-100 pt-4 text-center">
              <p className="text-xs text-gray-400">Verified via ASAM Member Portal</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-navy hover:underline">
            Return to ASAM website
          </Link>
        </div>
      </div>
    </div>
  );
}
