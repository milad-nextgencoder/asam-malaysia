'use client';

import Link from 'next/link';
import { User, Mail, CheckCircle, AlertCircle, LogOut, Camera, CreditCard, Clock, XCircle, Send, Calendar, Bell } from 'lucide-react';
import { signOut } from '@/app/member/actions/auth';
import type { MembershipApplication } from '@/lib/member/types';

interface MemberDashboardProps {
  userName: string;
  userEmail: string;
  emailVerified: boolean;
  profileCompleted: boolean;
  profilePhotoUrl: string | null;
  application: MembershipApplication | null;
  universityName: string | null;
}

const STATUS_CONFIG = {
  draft: { label: 'Not Submitted', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
  submitted: { label: 'Application Submitted', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
  under_review: { label: 'Under Review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export function MemberDashboard({
  userName,
  userEmail,
  emailVerified,
  profileCompleted,
  profilePhotoUrl,
  application,
  universityName,
}: MemberDashboardProps) {
  const status = application?.status ?? 'draft';
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-gray-900">{userName}</h1>
            <p className="mt-1 text-sm text-gray-500">{userEmail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Email verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <AlertCircle className="h-3 w-3" />
                  Email not verified
                </span>
              )}
              {profileCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Profile complete
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <AlertCircle className="h-3 w-3" />
                  Profile incomplete
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Membership Status Card */}
      <div className={`rounded-2xl border p-6 ${config.bg} border-gray-200`}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Membership Status</p>
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
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Reason</p>
            <p className="mt-1 text-sm text-red-800">{application.rejection_reason}</p>
          </div>
        )}

        {status === 'draft' && !profileCompleted && (
          <div className="mt-4 rounded-lg bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Complete your profile to submit a membership application.
            </p>
          </div>
        )}

        {status === 'draft' && profileCompleted && (
          <div className="mt-4">
            <Link
              href="/member/membership"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
            >
              <Send className="h-4 w-4" />
              Submit Application
            </Link>
          </div>
        )}

        {status === 'rejected' && (
          <div className="mt-4">
            <Link
              href="/member/membership"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
            >
              <Send className="h-4 w-4" />
              Resubmit Application
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/member/membership"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 group-hover:bg-navy/10">
            <CreditCard className="h-6 w-6 text-navy" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-gray-900">Membership</h3>
          <p className="mt-1 text-sm text-gray-500">View your membership status and application.</p>
        </Link>

        <Link
          href="/member/profile"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 group-hover:bg-navy/10">
            <User className="h-6 w-6 text-navy" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-gray-900">Edit Profile</h3>
          <p className="mt-1 text-sm text-gray-500">Update your personal information and photo.</p>
        </Link>

        <Link
          href="/member/events"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 group-hover:bg-navy/10">
            <Calendar className="h-6 w-6 text-navy" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-gray-900">Events</h3>
          <p className="mt-1 text-sm text-gray-500">Browse and register for ASAM events.</p>
        </Link>

        <Link
          href="/member/notifications"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 group-hover:bg-navy/10">
            <Bell className="h-6 w-6 text-navy" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-gray-900">Notifications</h3>
          <p className="mt-1 text-sm text-gray-500">View your notifications and updates.</p>
        </Link>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-gray-900">Account</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{userEmail}</dd>
          </div>
          {universityName && (
            <div className="flex justify-between">
              <dt className="text-gray-500">University</dt>
              <dd className="text-gray-900">{universityName}</dd>
            </div>
          )}
          {application?.member_id && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Member ID</dt>
              <dd className="font-mono text-gray-900">{application.member_id}</dd>
            </div>
          )}
        </dl>
        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
