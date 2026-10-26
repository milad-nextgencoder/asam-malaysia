'use client';

import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMemberAction } from '@/hooks/use-member-action';
import { safeSiteLink } from '@/lib/member/validation';
import { markNotificationRead, markAllNotificationsRead } from '@/app/member/actions/notifications';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const TYPE_COLORS = {
  info: 'text-blue-500 bg-blue-50',
  success: 'text-green-500 bg-green-50',
  warning: 'text-amber-500 bg-amber-50',
  error: 'text-red-500 bg-red-50',
};

export function MemberNotificationsList({ notifications }: { notifications: NotificationItem[] }) {
  const [items, setItems] = useState(notifications);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { run, pending: busyAll, error } = useMemberAction();
  useEffect(() => setItems(notifications), [notifications]);

  async function handleMarkRead(id: string) {
    if (busyAll) return;
    setBusyId(id);
    await run(() => markNotificationRead(id), () => setItems((previous) => previous.map((n) => n.id === id ? { ...n, read: true } : n)));
    setBusyId(null);
  }
  async function handleMarkAllRead() {
    await run(markAllNotificationsRead, () => setItems((previous) => previous.map((n) => ({ ...n, read: true }))));
  }
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''} on this page` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={busyAll}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {busyAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((notification) => {
            const Icon = TYPE_ICONS[notification.type];
            const colorClass = TYPE_COLORS[notification.type];

            return (
              <div
                key={notification.id}
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  notification.read
                    ? 'border-gray-200 bg-white'
                    : 'border-navy/20 bg-navy/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notification.id)}
                          disabled={busyAll}
                          className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {busyId === notification.id ? '...' : 'Mark read'}
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {safeSiteLink(notification.link) && (
                        <Link href={safeSiteLink(notification.link)!} className="font-medium text-gold-dark hover:underline">
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
