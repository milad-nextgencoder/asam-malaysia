'use client';

import Link from 'next/link';
import { Search, Eye, CheckCircle, XCircle, Clock, Send, CreditCard } from 'lucide-react';
import { useState, useMemo } from 'react';

interface MemberRecord {
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
  profile_completed: boolean;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
  membership_status?: string | null;
  member_id?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Not Submitted', className: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700' },
  under_review: { label: 'Under Review', className: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-green-50 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700' },
};

export function AdminMemberList({ members }: { members: MemberRecord[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (statusFilter !== 'all' && m.membership_status !== statusFilter) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      return (
        `${m.first_name ?? ''} ${m.last_name ?? ''} ${m.preferred_name ?? ''} ${m.email ?? ''} ${m.member_id ?? ''}`
          .toLowerCase()
          .includes(query)
      );
    });
  }, [members, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: members.length };
    for (const m of members) {
      const status = m.membership_status ?? 'draft';
      counts[status] = (counts[status] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  /**
   * Members table.
   *
   * On narrow screens the table keeps every column and its View action and
   * scrolls horizontally inside the `overflow-x-auto` wrapper, so the page
   * itself never scrolls sideways. No action is hidden or removed on mobile.
   */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#172436]">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage member profiles and membership applications.</p>
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
          <option value="draft">Not Submitted ({statusCounts.draft ?? 0})</option>
          <option value="submitted">Submitted ({statusCounts.submitted ?? 0})</option>
          <option value="under_review">Under Review ({statusCounts.under_review ?? 0})</option>
          <option value="approved">Approved ({statusCounts.approved ?? 0})</option>
          <option value="rejected">Rejected ({statusCounts.rejected ?? 0})</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search || statusFilter !== 'all' ? 'No members match your search.' : 'No members found.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[612px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Member ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Profile</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((member) => {
                  const displayName =
                    member.preferred_name ||
                    [member.first_name, member.last_name].filter(Boolean).join(' ') ||
                    'Unnamed';
                  const status = member.membership_status ?? 'draft';
                  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{displayName}</td>
                      <td className="px-4 py-3 text-gray-600">{member.email ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{member.member_id ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {member.profile_completed ? (
                          <span className="text-green-600"><CheckCircle className="h-4 w-4" /></span>
                        ) : (
                          <span className="text-gray-400"><XCircle className="h-4 w-4" /></span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/members/${member.user_id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
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
