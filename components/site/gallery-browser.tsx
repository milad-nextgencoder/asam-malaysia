'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/site/section-header';
import { EmptyState } from '@/components/site/empty-state';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, X } from 'lucide-react';

const galleryCategories = ['All', 'Events', 'Students', 'Culture', 'Sports', 'Conferences', 'Leadership', 'Community', 'Academic', 'Other'];

/**
 * Interactive gallery (category filter, album cards, image grid, lightbox).
 *
 * Albums and items are fetched server-side in app/gallery/page.tsx and passed
 * in as props, so the published albums/images are part of the SSR HTML while
 * filtering and the lightbox stay instant and local.
 */
export function GalleryBrowser({ albums, items }: { albums: any[]; items: any[] }) {
  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const visibleItems = useMemo(() => items.filter((item) => filter === 'All' || albums.find((album) => album.id === item.album_id)?.category === filter), [items, albums, filter]);
  const visibleAlbums = albums.filter((album) => filter === 'All' || album.category === filter);

  return (
    <>
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {galleryCategories.map((cat) => (
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

          {/* Published album cards */}
          <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleAlbums.map((album) => (
              <Link key={album.id} href={`/gallery/${album.id}`} className="group overflow-hidden rounded-xl border border-border bg-card shadow-premium transition-all hover:-translate-y-1 hover:border-gold/30 hover:shadow-premium-lg">
                {album.cover_image_url ? <img src={album.cover_image_url} loading="lazy" alt={`${album.name} album cover`} className="aspect-[16/9] w-full object-cover"/> : <div className="flex aspect-[16/9] items-center justify-center bg-secondary/60"><ImageIcon className="h-10 w-10 text-muted-foreground/40"/></div>}
                <div className="p-4"><div className="text-[9px] font-bold uppercase tracking-widest text-gold-dark">{album.category || 'ASAM Album'}</div><h3 className="mt-1 font-display text-lg font-semibold">{album.name}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{album.description || 'View published photos from this album.'}</p></div>
              </Link>
            ))}
          </div>
          {/* Published image preview grid */}
          {visibleItems.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleItems.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedImage(item.image_url)}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-premium hover:border-gold/30 transition-all duration-300 animate-fade-up text-left"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <img
                  src={item.image_url}
                  alt={item.title || item.caption || `Published ASAM gallery image ${i + 1}`}
                  loading="lazy"
                  className="aspect-square w-full object-cover cursor-pointer"
                />
              </button>
            ))}
          </div>}
          {!visibleAlbums.length && !visibleItems.length && <EmptyState title="No published albums yet" message="ASAM photo albums will appear here after an administrator publishes them."/>}
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full rounded-2xl bg-background p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Close image"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Expanded gallery item"
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Albums */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Albums"
            title="Photo albums"
            description="Browse albums from past ASAM events and activities."
          />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleAlbums.map((album)=><Link key={album.id} href={`/gallery/${album.id}`} className="rounded-xl border bg-card p-5 hover:border-gold/40"><h3 className="font-display font-semibold">{album.name}</h3><p className="mt-1 text-xs text-muted-foreground">{album.category || 'Gallery'} · View album</p></Link>)}</div>
        </div>
      </section>
    </>
  );
}
