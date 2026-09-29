'use client';

import { useState } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Send, RotateCcw, Award, Download, ShieldCheck } from 'lucide-react';
import { submitApplication } from '@/app/member/actions/membership';
import type { MembershipApplication } from '@/lib/member/types';

const STATUS_CONFIG = {
  draft: { label: 'Not Submitted', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
  submitted: { label: 'Application Submitted', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
  under_review: { label: 'Under Review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

interface MembershipStatusCardProps {
  application: MembershipApplication | null;
  profileCompleted: boolean;
  universityName: string | null;
  program: string | null;
}

export function MembershipStatusCard({
  application,
  profileCompleted,
  universityName,
  program,
}: MembershipStatusCardProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const status = application?.status ?? 'draft';
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  async function handleSubmit() {
    setBusy(true);
    setMessage('');
    const result = await submitApplication();
    if (result.ok) {
      setMessage(
        status === 'rejected'
          ? 'Application resubmitted successfully.'
          : 'Application submitted successfully.'
      );
    } else {
      setMessage(result.message);
    }
    setBusy(false);
  }

  const canSubmit = profileCompleted && (status === 'draft' || status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Membership</h1>
        <p className="mt-1 text-sm text-gray-500">Your ASAM membership application and status.</p>
      </div>

      {/* Status Card */}
      <div className={`rounded-2xl border p-6 ${config.bg} border-gray-200`}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</p>
            <p className={`font-display text-lg font-bold ${config.color}`}>{config.label}</p>
          </div>
        </div>

        {application?.member_id && (
          <div className="mt-4 rounded-lg bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Member ID</p>
            <p className="mt-1 font-mono text-lg font-bold text-navy">{application.member_id}</p>
          </div>
        )}

        {application?.rejection_reason && (
          <div className="mt-4 rounded-lg bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Reason for Rejection</p>
            <p className="mt-1 text-sm text-red-800">{application.rejection_reason}</p>
            {status === 'rejected' && (
              <p className="mt-2 text-xs text-red-600">
                Please review the reason above, update your profile if needed, and resubmit your application.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Profile Completion */}
      {!profileCompleted && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Profile incomplete</p>
              <p className="mt-1 text-sm text-amber-700">
                Complete your profile before submitting a membership application.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Application Details */}
      {application && application.status !== 'draft' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-gray-900">Application Details</h3>
          <dl className="mt-4 space-y-3 text-sm">
            {universityName && (
              <div className="flex justify-between">
                <dt className="text-gray-500">University</dt>
                <dd className="text-gray-900">{universityName}</dd>
              </div>
            )}
            {program && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Program</dt>
                <dd className="text-gray-900">{program}</dd>
              </div>
            )}
            {application.application_submitted_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900">
                  {new Date(application.application_submitted_at).toLocaleDateString()}
                </dd>
              </div>
            )}
            {application.reviewed_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Reviewed</dt>
                <dd className="text-gray-900">
                  {new Date(application.reviewed_at).toLocaleDateString()}
                </dd>
              </div>
            )}
            {application.approved_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Approved</dt>
                <dd className="text-gray-900">
                  {new Date(application.approved_at).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Submit Button */}
      {canSubmit && (
        <div className="space-y-4">
          {message && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${
              message.includes('successfully')
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            {status === 'rejected' ? (
              <>
                <RotateCcw className="h-4 w-4" />
                {busy ? 'Resubmitting...' : 'Resubmit Application'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {busy ? 'Submitting...' : 'Submit Application'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Status-specific messages */}
      {status === 'submitted' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Your application has been submitted and is waiting for review. You will be notified once it has been reviewed.
        </div>
      )}

      {status === 'under_review' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Your application is currently under review by the ASAM administration. This process may take several days.
        </div>
      )}

      {status === 'approved' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Congratulations! Your membership has been approved. Your official ASAM Member ID is displayed above.
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/certificate/${application!.member_id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy/90"
            >
              <Award className="h-4 w-4" />
              View Certificate
            </a>
            <a
              href={`/api/certificate/${encodeURIComponent(application!.member_id!)}/pdf`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </a>
            <a
              href={`/verify/member/${application!.member_id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Verify Membership
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
