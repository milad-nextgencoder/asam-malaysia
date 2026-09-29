'use client';

import { useEffect, useState } from 'react';
import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Search, Newspaper, Clock, User } from 'lucide-react';

const newsCategories = [
  'All', 'ASAM News', 'Student Stories', 'Academic', 'Career', 'Events', 'Community', 'Alumni', 'Opportunities',
];

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => { const supabase = createClient(); supabase.from('news').select('id,title,slug,excerpt,content,featured_image_url,author,category,publication_date').eq('status', 'published').order('publication_date', { ascending: false, nullsFirst: false }).then(({ data, error }) => { setArticles(data ?? []); setLoadFailed(Boolean(error)); }); }, []);
  const categories = ['All', ...Array.from(new Set(articles.map((article) => article.category).filter(Boolean))) as string[]];
  const filtered = articles.filter((article) => (filter === 'All' || article.category === filter) && `${article.title} ${article.excerpt ?? ''} ${article.content ?? ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHero
        eyebrow="News & Stories"
        title="The ASAM editorial platform"
        description="Latest updates, announcements, stories, and opportunities from the Afghan student community in Malaysia."
      />

      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loadFailed && <p role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The latest stories could not be loaded. Please refresh in a moment.</p>}
          {/* Published stories retain the existing editorial card layout. */}
          {filtered[0] && <div className="mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-navy p-12 flex items-center justify-center text-center min-h-[300px]">
                  {filtered[0].featured_image_url ? <img src={filtered[0].featured_image_url} alt="" className="max-h-[300px] w-full object-cover"/> : <div>
                    <Newspaper className="h-16 w-16 text-gold mx-auto mb-4" />
                    <p className="text-white/40 text-sm">Featured Article — Coming Soon</p>
                  </div>}
                </div>
                <div className="p-8 lg:p-12">
                  <span className="text-xs font-semibold text-gold-dark bg-gold/10 px-3 py-1 rounded-full">
                    {filtered[0].category || 'ASAM News'}
                  </span>
                  <h2 className="font-display text-2xl lg:text-3xl font-bold mt-4 mb-4">
                    {filtered[0].title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {filtered[0].excerpt || filtered[0].content || ''}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {filtered[0].author && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{filtered[0].author}</span>}
                    {filtered[0].publication_date && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(filtered[0].publication_date).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  filter === cat ? 'gradient-navy text-white shadow-premium' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles */}
          {filtered.length > (filtered[0] ? 1 : 0) ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.slice(filtered[0] ? 1 : 0).map((article) => <article key={article.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">{article.featured_image_url && <img src={article.featured_image_url} alt="" className="h-44 w-full object-cover"/>}<div className="p-5">{article.category && <span className="text-xs font-semibold text-gold-dark">{article.category}</span>}<h2 className="mt-2 font-display text-lg font-bold">{article.title}</h2>{article.excerpt && <p className="mt-2 text-sm text-muted-foreground">{article.excerpt}</p>}<details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold text-gold-dark">Read article</summary><p className="mt-3 whitespace-pre-wrap leading-relaxed text-muted-foreground">{article.content || article.excerpt || ''}</p></details></div></article>)}</div> : !filtered.length && <EmptyState title="No Articles Yet" message="Published ASAM stories and announcements will appear here when available."/>}
        </div>
      </section>

      <CTASection
        title="Have a story to share?"
        description="If you have a story, announcement, or update that would benefit the ASAM community, we'd love to feature it."
        primaryLabel="Submit a Story"
        primaryHref="/contact"
        secondaryLabel="Join ASAM"
        secondaryHref="/membership"
      />
    </>
  );
}
