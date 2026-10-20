'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/site/section-header';
import { EmptyState } from '@/components/site/empty-state';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, X } from 'lucide-react';

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const galleryCategories = ['All', ...Array.from(new Set(albums.map((album) => album.category).filter(Boolean))) as string[]];
  const visibleItems = useMemo(() => items.filter((item) => filter === 'All' || albums.find((album) => album.id === item.album_id)?.category === filter), [items, albums, filter]);
  const visibleAlbums = albums.filter((album) => filter === 'All' || album.category === filter);

  useEffect(() => {
    if (!selectedImage) return;
    const returnFocus = returnFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedImage(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      returnFocus?.focus();
    };
  }, [selectedImage]);

  function openImage(url: string) {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setSelectedImage(url);
  }

  return (
    <>
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Gallery" title="Published albums and photographs" description="Browse ASAM event and community photographs." className="mb-6" />
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={filter === cat}
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
                onClick={() => openImage(item.image_url)}
                aria-label={`Open photo: ${item.title || item.caption || `ASAM gallery image ${i + 1}`}`}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-premium hover:border-gold/30 transition-all duration-300 animate-fade-up text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          {!visibleAlbums.length && !visibleItems.length && <EmptyState title={filter === 'All' ? 'No published albums yet' : `No ${filter.toLowerCase()} photos published`} message={filter === 'All' ? 'ASAM photo albums will appear here after they are published.' : 'Try another category to view published photographs.'}/>}
        </div>
      </section>

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(event) => { if (event.target === event.currentTarget) setSelectedImage(null); }}
          onKeyDown={(event) => { if (event.key === 'Tab') { event.preventDefault(); closeButtonRef.current?.focus(); } }}
        >
          <div className="relative max-w-5xl w-full rounded-2xl bg-background p-3 shadow-2xl">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close photo preview"
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

    </>
  );
}
