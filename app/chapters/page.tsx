'use client';

import { useEffect, useState } from 'react';
import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { MapPin, Building2, Users, Search } from 'lucide-react';

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<any[]>([]);
  useEffect(() => { const supabase = createClient(); supabase.from('chapters').select('id,name,state,city,description,university,representative,image_url,display_order,status').in('status', ['active','coming_soon']).order('display_order', { ascending: true }).then(({ data }) => setChapters(data ?? [])); }, []);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'coming_soon' | 'active'>('all');
  const states = Array.from(new Map(chapters.map((chapter) => [chapter.state, { id: chapter.state, name: chapter.state, chapters: chapters.filter((item) => item.state === chapter.state) }])).values());
  const filteredStates = states.filter((state) => filter === 'all' || state.chapters.some((chapter) => chapter.status === filter));
  const selected = states.find((state) => state.id === selectedState);

  return (
    <>
      <PageHero
        eyebrow="Chapters"
        title="A growing national chapter network"
        description="ASAM is building state, city, and university chapters across Malaysia. Chapter information will appear here as new chapters are established."
      />

      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="State Chapters"
            title="Explore the national network"
            description="Click on a state to learn about its chapter status. New chapters are being established as ASAM grows."
          />

          {/* Filter */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { key: 'all', label: 'All States' },
              { key: 'coming_soon', label: 'Coming Soon' },
              { key: 'active', label: 'Active' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  filter === f.key
                    ? 'gradient-navy text-white shadow-premium'
                    : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* States Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStates.map((state, i) => (
              <button
                key={state.id}
                onClick={() => setSelectedState(state.id)}
                className={cn(
                  'text-left p-5 rounded-xl border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up',
                  selectedState === state.id ? 'border-gold/40 ring-2 ring-gold/20' : 'border-border'
                )}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {state.chapters[0]?.image_url && <img src={state.chapters[0].image_url} alt="" className="mb-4 h-32 w-full rounded-xl object-cover"/>}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
                    <MapPin className="h-6 w-6 text-navy" />
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-3 py-1 rounded-full',
                    state.chapters.every((chapter) => chapter.status === 'coming_soon')
                      ? 'bg-gold/10 text-gold-dark'
                      : 'bg-secondary text-muted-foreground'
                  )}>
                    {state.chapters.every((chapter) => chapter.status === 'coming_soon') ? 'Coming Soon' : 'Active'}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mb-1">{state.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{state.chapters.length} listed chapter{state.chapters.length === 1 ? '' : 's'}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{state.chapters.map((chapter) => chapter.city).filter(Boolean).join(', ') || state.chapters[0]?.description || 'ASAM chapter information.'}</p>
              </button>
            ))}
          </div>

          {/* Selected State Detail */}
          {selected && (
            <div className="mt-6 p-5 rounded-xl border border-gold/30 bg-card shadow-premium-lg animate-scale-in">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold mb-1.5">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.chapters.map((chapter) => chapter.description).filter(Boolean).join(' ')}</p>
                </div>
                <span className={cn(
                  'text-sm font-semibold px-4 py-2 rounded-full',
                  selected.chapters.every((chapter) => chapter.status === 'coming_soon')
                    ? 'bg-gold/10 text-gold-dark'
                    : 'bg-secondary text-muted-foreground'
                )}>
                {selected.chapters.every((chapter) => chapter.status === 'coming_soon') ? 'Chapter Coming Soon' : 'Active Chapter'}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selected.chapters.map((chapter) => <div key={chapter.id} className="p-4 rounded-xl bg-secondary/40"><Building2 className="h-5 w-5 text-gold mb-2"/><div className="text-xs font-semibold">{chapter.name}</div><div className="text-sm text-muted-foreground">{[chapter.city, chapter.university].filter(Boolean).join(' · ')}</div>{chapter.representative && <div className="mt-1 text-xs text-muted-foreground">Representative: {chapter.representative}</div>}</div>)}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-gold/5 border border-gold/20">
                <p className="text-sm text-muted-foreground">
                  {selected.chapters.map((chapter) => chapter.description).filter(Boolean).join(' ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* City & University Chapters */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="City & University Chapters"
            title="Local community chapters"
            description="City and university chapters bring the ASAM community to your doorstep. These chapters will be established as the network grows."
          />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <EmptyState
                title={chapters.some((chapter) => chapter.city) ? 'City Chapters' : 'No City Chapters Yet'}
                message={chapters.filter((chapter) => chapter.city).map((chapter) => `${chapter.name} · ${chapter.city}`).join(' | ') || 'ASAM is expanding its national network. City chapter information will appear here as new chapters are established.'}
              />
            </div>
            <div>
              <EmptyState
                title={chapters.some((chapter) => chapter.university) ? 'University Chapters' : 'No University Chapters Yet'}
                message={chapters.filter((chapter) => chapter.university).map((chapter) => `${chapter.name} · ${chapter.university}`).join(' | ') || 'University chapters are being established. Visit the University Network page to see the status of your university.'}
              />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Start a chapter at your university"
        description="If your university or state does not yet have an ASAM chapter, you can help start one. Join ASAM and express your interest in becoming a chapter leader."
        primaryLabel="Join ASAM"
        primaryHref="/membership"
        secondaryLabel="View Universities"
        secondaryHref="/universities"
      />
    </>
  );
}
