'use client';

import Link from 'next/link';
import { Search, Eye, CheckCircle, XCircle, Clock, Send, AlertCircle, CreditCard } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ApplicationRecord {
  id: string;
  user_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  member_id: string | null;
  rejection_reason: string | null;
  application_submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  member: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    preferred_name: string | null;
    email: string | null;
    university_id: string | null;
    program: string | null;
    profile_photo_url: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  draft: { label: 'Not Submitted', className: 'bg-gray-100 text-gray-700', icon: AlertCircle },
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700', icon: Send },
  under_review: { label: 'Under Review', className: 'bg-amber-50 text-amber-700', icon: Clock },
  approved: { label: 'Approved', className: 'bg-green-50 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700', icon: XCircle },
};

export function AdminApplicationsList({ applications }: { applications: ApplicationRecord[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      const memberName = app.member
        ? `${app.member.first_name ?? ''} ${app.member.last_name ?? ''} ${app.member.preferred_name ?? ''}`.toLowerCase()
        : '';
      return (
        memberName.includes(query) ||
        (app.member?.email ?? '').toLowerCase().includes(query) ||
        (app.member_id ?? '').toLowerCase().includes(query)
      );
    });
  }, [applications, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length };
    for (const app of applications) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }
    return counts;
  }, [applications]);

  const pendingCount = (statusCounts.submitted ?? 0) + (statusCounts.under_review ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#172436]">Membership Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage membership applications. {pendingCount > 0 ? `${pendingCount} application${pendingCount > 1 ? 's' : ''} pending review.` : 'No applications pending review.'}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or member ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
        >
          <option value="all">All ({statusCounts.all ?? 0})</option>
          <option value="submitted">Submitted ({statusCounts.submitted ?? 0})</option>
          <option value="under_review">Under Review ({statusCounts.under_review ?? 0})</option>
          <option value="approved">Approved ({statusCounts.approved ?? 0})</option>
          <option value="rejected">Rejected ({statusCounts.rejected ?? 0})</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search || statusFilter !== 'all' ? 'No applications match your search.' : 'No applications found.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Applicant</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Member ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Submitted</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app) => {
                  const displayName = app.member
                    ? app.member.preferred_name ||
                      [app.member.first_name, app.member.last_name].filter(Boolean).join(' ') ||
                      'Unnamed'
                    : 'Unknown';
                  const statusConfig = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.draft;
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                            {app.member?.profile_photo_url ? (
                              <img src={app.member.profile_photo_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="text-xs font-bold text-gray-400">
                                  {displayName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{app.member?.email ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{app.member_id ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {app.application_submitted_at
                          ? new Date(app.application_submitted_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/members/${app.user_id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
