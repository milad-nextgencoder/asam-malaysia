import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/site/empty-state';

export async function PublicEventList({ category }: { category: string }) {
  const { data, error } = await createClient()
    .from('events')
    .select('id,title,description,date,time,location,featured_image_url')
    .eq('status', 'published')
    .eq('category', category)
    .order('date', { ascending: true, nullsFirst: false })
    .range(0, 5);

  if (error) return <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Published events are temporarily unavailable.</p>;
  if (!data?.length) return <EmptyState title={`No published ${category.toLowerCase()} events yet`} message="Events published through the ASAM Admin Panel will appear here." />;

  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {data.map((event) => <article key={event.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-premium">
      {event.featured_image_url && <img src={event.featured_image_url} alt="" loading="lazy" className="h-40 w-full object-cover" />}
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">{event.date || 'Date to be announced'}{event.time ? ` · ${event.time}` : ''}</p>
        <h3 className="mt-2 font-display text-lg font-bold">{event.title}</h3>
        {event.location && <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>}
        {event.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{event.description}</p>}
        <Link href="/events" className="mt-4 inline-flex text-sm font-semibold text-gold-dark underline">View all events</Link>
      </div>
    </article>)}
  </div>;
}
