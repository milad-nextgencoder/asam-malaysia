'use client';

import { useState } from 'react';
import { User, Mail, Shield, Bell, Lock, ChevronRight, CreditCard, CheckCircle, XCircle, Clock, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface MemberSettingsPageProps {
  userName: string;
  userEmail: string;
  emailVerified: boolean;
  membershipStatus: string;
  memberId: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  draft: { label: 'Not Submitted', icon: AlertCircle, className: 'text-gray-500' },
  submitted: { label: 'Application Submitted', icon: Send, className: 'text-blue-600' },
  under_review: { label: 'Under Review', icon: Clock, className: 'text-amber-600' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'text-green-600' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'text-red-600' },
};

export function MemberSettingsPage({
  userName,
  userEmail,
  emailVerified,
  membershipStatus,
  memberId,
}: MemberSettingsPageProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const statusConfig = STATUS_CONFIG[membershipStatus] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const sections = [
    {
      id: 'account',
      icon: User,
      title: 'Account Information',
      description: 'View your account details and membership status.',
    },
    {
      id: 'membership',
      icon: CreditCard,
      title: 'Membership',
      description: 'View your membership status and application details.',
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Email',
      description: userEmail,
    },
    {
      id: 'security',
      icon: Lock,
      title: 'Security',
      description: 'Manage your password and account security.',
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'View and manage your notifications.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5">
                  <Icon className="h-5 w-5 text-navy" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{section.description}</p>
                </div>
                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
              </button>

              {activeSection === section.id && (
                <div className="border-t border-gray-100 p-5">
                  {section.id === 'account' && (
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="text-gray-900">{userName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Email</dt>
                        <dd className="text-gray-900">{userEmail}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Member ID</dt>
                        <dd className="font-mono text-gray-900">{memberId ?? '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Membership Status</dt>
                        <dd className={`inline-flex items-center gap-1 ${statusConfig.className}`}>
                          <StatusIcon className="h-4 w-4" />
                          {statusConfig.label}
                        </dd>
                      </div>
                    </dl>
                  )}

                  {section.id === 'membership' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`inline-flex items-center gap-1 ${statusConfig.className}`}>
                          <StatusIcon className="h-4 w-4" />
                          {statusConfig.label}
                        </span>
                      </div>
                      {memberId && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Member ID</span>
                          <span className="font-mono text-gray-900">{memberId}</span>
                        </div>
                      )}
                      <Link
                        href="/member/membership"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <CreditCard className="h-4 w-4" />
                        View Membership Details
                      </Link>
                    </div>
                  )}

                  {section.id === 'email' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Email Address</span>
                        <span className="text-gray-900">{userEmail}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Verification</span>
                        {emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <Shield className="h-4 w-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-600">Not verified — check your email</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        To change your email, please contact ASAM administration.
                      </p>
                    </div>
                  )}

                  {section.id === 'security' && (
                    <div className="space-y-3">
                      <Link
                        href="/member/forgot-password"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Lock className="h-4 w-4" />
                        Change Password
                      </Link>
                      <p className="text-xs text-gray-400">
                        For security, password changes require email verification.
                      </p>
                    </div>
                  )}

                  {section.id === 'notifications' && (
                    <div className="space-y-3">
                      <Link
                        href="/member/notifications"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Bell className="h-4 w-4" />
                        View Notifications
                      </Link>
                      <p className="text-xs text-gray-400">
                        Membership updates, event announcements, and important notices.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
