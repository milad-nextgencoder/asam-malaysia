'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Phone, GraduationCap, MapPin, Clock, CreditCard, Send, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { approveMemberAction, rejectMemberAction, startReviewAction } from '@/app/member/actions/membership';
import type { MembershipApplication } from '@/lib/member/types';

interface MemberProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  email: string | null;
  phone: string | null;
  university_id: string | null;
  program: string | null;
  faculty: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  profile_completed: boolean;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Not Submitted',
  submitted: 'Application Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-50 text-blue-700',
  under_review: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  draft: AlertCircle,
  submitted: Send,
  under_review: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

export function AdminMemberDetail({
  member,
  application,
  universityName,
}: {
  member: MemberProfile;
  application: MembershipApplication | null;
  universityName: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const displayName =
    member.preferred_name || [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Unnamed';
  const status = application?.status ?? 'draft';

  async function handleStartReview() {
    setBusy(true);
    setMessage('');
    const result = await startReviewAction(member.user_id);
    if (result.ok) {
      setMessage('Application moved to review.');
    } else {
      setMessage(result.message);
    }
    setBusy(false);
  }

  async function handleApprove() {
    setBusy(true);
    setMessage('');
    const result = await approveMemberAction(member.user_id);
    if (result.ok) {
      setMessage('Member approved successfully.');
    } else {
      setMessage(result.message);
    }
    setBusy(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setMessage('Please provide a reason for rejection.');
      return;
    }
    setBusy(true);
    setMessage('');
    const result = await rejectMemberAction(member.user_id, rejectReason.trim());
    if (result.ok) {
      setMessage('Member rejected.');
      setShowReject(false);
      setRejectReason('');
    } else {
      setMessage(result.message);
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/members" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#172436]">{displayName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Member since {new Date(member.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}>
          {(() => {
            const StatusIcon = STATUS_ICONS[status] ?? AlertCircle;
            return <StatusIcon className="h-3 w-3" />;
          })()}
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {application?.member_id && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Member ID</p>
          <p className="mt-1 font-mono text-lg font-bold text-navy">{application.member_id}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <User className="h-4 w-4 text-gray-400" />
            Profile
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">First Name</dt>
              <dd className="text-gray-900">{member.first_name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Last Name</dt>
              <dd className="text-gray-900">{member.last_name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Preferred Name</dt>
              <dd className="text-gray-900">{member.preferred_name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Profile Complete</dt>
              <dd>{member.profile_completed ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Mail className="h-4 w-4 text-gray-400" />
            Contact
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{member.email ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900">{member.phone ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            Academic
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">University</dt>
              <dd className="text-gray-900">{universityName ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Program</dt>
              <dd className="text-gray-900">{member.program ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Faculty</dt>
              <dd className="text-gray-900">{member.faculty ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="h-4 w-4 text-gray-400" />
            Location
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">City</dt>
              <dd className="text-gray-900">{member.city ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">State</dt>
              <dd className="text-gray-900">{member.state ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {member.bio && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bio</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{member.bio}</p>
        </div>
      )}

      {application && application.status !== 'draft' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Application Timestamps</p>
          <dl className="mt-3 space-y-2 text-sm">
            {application.application_submitted_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900">{new Date(application.application_submitted_at).toLocaleString()}</dd>
              </div>
            )}
            {application.reviewed_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Reviewed</dt>
                <dd className="text-gray-900">{new Date(application.reviewed_at).toLocaleString()}</dd>
              </div>
            )}
            {application.approved_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Approved</dt>
                <dd className="text-gray-900">{new Date(application.approved_at).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {application?.rejection_reason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Rejection Reason</p>
          <p className="mt-2 text-sm text-red-800">{application.rejection_reason}</p>
        </div>
      )}

      {status === 'submitted' ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-gray-900">Review Application</h3>
          <p className="mt-1 text-sm text-gray-500">Begin review or reject this membership application.</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleStartReview}
              disabled={busy}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
            >
              {busy ? 'Processing...' : 'Begin Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowReject(true)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        </div>
      ) : null}

      {status === 'under_review' ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-gray-900">Review Application</h3>
          <p className="mt-1 text-sm text-gray-500">Approve or reject this membership application.</p>

          {showReject ? (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="reject-reason" className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Reason for rejection
                </label>
                <textarea
                  id="reject-reason"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Explain why this application is being rejected..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={busy}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {busy ? 'Processing...' : 'Confirm Reject'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReject(false); setRejectReason(''); }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={busy}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {busy ? 'Processing...' : 'Approve Membership'}
              </button>
              <button
                type="button"
                onClick={() => setShowReject(true)}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
