'use client';

import { Calendar, MapPin, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { registerForEvent, cancelEventRegistration } from '@/app/member/actions/events';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  category: string | null;
  featured_image_url: string | null;
  registration_url: string | null;
}

export function MemberEventsList({ events, registeredEventIds }: { events: EventItem[]; registeredEventIds: Set<string> }) {
  const [eventRegistrations, setEventRegistrations] = useState(registeredEventIds);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function handleRegister(eventId: string) {
    setBusyId(eventId);
    setMessage('');
    const result = await registerForEvent(eventId);
    if (result.ok) {
      setEventRegistrations((prev) => new Set(prev).add(eventId));
      setMessage('Successfully registered for event.');
    } else {
      setMessage(result.message);
    }
    setBusyId(null);
  }

  async function handleCancel(eventId: string) {
    setBusyId(eventId);
    setMessage('');
    const result = await cancelEventRegistration(eventId);
    if (result.ok) {
      setEventRegistrations((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      setMessage('Registration cancelled.');
    } else {
      setMessage(result.message);
    }
    setBusyId(null);
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-sm text-gray-500">No upcoming events at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Events</h1>
        <p className="mt-1 text-sm text-gray-500">Browse and register for ASAM events.</p>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {events.map((event) => {
          const isRegistered = eventRegistrations.has(event.id);
          const isPast = event.date ? new Date(`${event.date}T${event.time || '23:59'}`) < new Date() : false;

          return (
            <div key={event.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {event.category && (
                      <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-medium text-navy">
                        {event.category}
                      </span>
                    )}
                    {isPast && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">Past</span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-gray-900">{event.title}</h3>
                  {event.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{event.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {event.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {event.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {event.time}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {isPast ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-500">
                      Event Ended
                    </span>
                  ) : isRegistered ? (
                    <button
                      type="button"
                      onClick={() => handleCancel(event.id)}
                      disabled={busyId === event.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {busyId === event.id ? 'Cancelling...' : 'Registered — Cancel'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRegister(event.id)}
                      disabled={busyId === event.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
                    >
                      {busyId === event.id ? 'Registering...' : 'Register'}
                    </button>
                  )}
                </div>
              </div>

              {event.registration_url && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-gold-dark hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Event registration link
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
