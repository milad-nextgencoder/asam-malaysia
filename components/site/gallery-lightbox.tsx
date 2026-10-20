'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type GalleryImage = {
  id: string;
  image_url: string;
  title?: string | null;
  caption?: string | null;
  display_order?: number;
};

export function GalleryLightbox({ images: initial, albumId }: { images: GalleryImage[]; albumId: string }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [images, setImages] = useState(initial);
  const [more, setMore] = useState(initial.length === 48);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selected) return;
    const returnFocus = returnFocusRef.current;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      returnFocus?.focus();
    };
  }, [selected]);

  function openImage(image: GalleryImage) {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setSelected(image);
  }

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await createClient()
        .from('gallery_items')
        .select('id,image_url,title,caption,display_order')
        .eq('album_id', albumId)
        .eq('status', 'published')
        .order('display_order')
        .range(images.length, images.length + 47);
      if (error) throw error;
      setImages((current) => [...current, ...(data ?? [])]);
      setMore((data?.length ?? 0) === 48);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            aria-label={`Open photo: ${image.title || image.caption || 'ASAM event photograph'}`}
            onClick={() => openImage(image)}
            className="overflow-hidden rounded-xl border bg-card text-left shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img loading="lazy" src={image.image_url} alt={image.title || image.caption || 'ASAM event photograph'} className="aspect-square w-full object-cover transition-transform hover:scale-[1.02]" />
            {(image.title || image.caption) && <span className="block p-3 text-sm text-muted-foreground">{image.title || image.caption}</span>}
          </button>
        ))}
      </div>
      {more && <button type="button" onClick={() => void loadMore()} disabled={loading} className="mx-auto mt-8 block rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-live="polite">{loading ? 'Loading photos…' : 'Load more photos'}</button>}
      {loadError && <p role="status" className="mt-4 text-center text-sm text-amber-800">More photos could not be loaded. Please try again.</p>}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}
          onKeyDown={(event) => { if (event.key === 'Tab') { event.preventDefault(); closeButtonRef.current?.focus(); } }}
        >
          <button ref={closeButtonRef} type="button" aria-label="Close photo preview" onClick={() => setSelected(null)} className="absolute right-5 top-5 rounded-full bg-black/50 p-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><X aria-hidden="true" /></button>
          <img src={selected.image_url} alt={selected.title || selected.caption || 'Expanded ASAM event photograph'} className="max-h-[90vh] max-w-full object-contain" />
        </div>
      )}
    </>
  );
}
