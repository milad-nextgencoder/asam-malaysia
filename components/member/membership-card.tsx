'use client';

import { QRCodeSVG } from 'qrcode.react';
import { User, GraduationCap, Calendar } from 'lucide-react';
import { getCertificateVerifyUrl, getClientSiteUrl } from '@/lib/member/site-url';

interface MembershipCardProps {
  memberName: string;
  memberId: string;
  universityName: string | null;
  program: string | null;
  status: string;
  profilePhotoUrl: string | null;
  issueDate: string | null;
}

export function MembershipCard({
  memberName,
  memberId,
  universityName,
  program,
  status,
  profilePhotoUrl,
  issueDate,
}: MembershipCardProps) {
  const verificationUrl = getCertificateVerifyUrl(memberId, getClientSiteUrl());

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <div className="bg-navy px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-white">ASAM</span>
            <span className="text-xs font-medium text-white/70">Afghan Students Association of Malaysia</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
              {profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Member</p>
              <h3 className="truncate font-display text-lg font-bold text-gray-900">{memberName}</h3>
              <p className="mt-0.5 font-mono text-sm font-semibold text-navy">{memberId}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{universityName ?? '—'}</span>
              {program && <span className="text-gray-400">· {program}</span>}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {issueDate
                  ? `Issued ${new Date(issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : '—'}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {status}
              </span>
            </div>
            <div className="text-center">
              <div className="inline-block rounded-lg border border-gray-200 bg-white p-2">
                <QRCodeSVG value={verificationUrl} size={80} level="M" />
              </div>
              <p className="mt-1 text-[9px] text-gray-400">Scan to verify</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
