import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { GalleryBrowser } from '@/components/site/gallery-browser';
import { createPublicClient } from '@/lib/supabase/server';
import { Video } from 'lucide-react';

export const metadata = {
  title: 'Gallery',
  description:
    'Photos, videos, and albums from ASAM events, programs, and community activities across Malaysia.',
};

// Gallery is cached with 60s ISR; admin gallery actions also call
// revalidatePath('/gallery') on every change, so updates appear promptly.
export const revalidate = 60;

async function getGalleryContent() {
  const db = createPublicClient();
  // The category column was added later (20260927010000); if a database has
  // not applied it yet, retry without it so the page still renders.
  let albumResult = await db.from('gallery_albums').select('id,name,description,category,cover_image_url,display_order,status').eq('status','published').order('display_order').range(0,99);
  if (albumResult.error) albumResult = await db.from('gallery_albums').select('id,name,description,cover_image_url,display_order,status').eq('status','published').order('display_order').range(0,99) as any;
  if (albumResult.error) return { albums: [] as any[], items: [] as any[], loadError: true };
  const albums = albumResult.data ?? [];
  const ids = albums.map((row: any) => row.id);
  if (!ids.length) return { albums, items: [] as any[], loadError: false };
  const result = await db.from('gallery_items').select('id,album_id,image_url,title,caption,display_order,status').in('album_id',ids).eq('status','published').order('display_order').range(0,47);
  return { albums, items: result.error ? [] : result.data ?? [], loadError: Boolean(result.error) };
}

export default async function GalleryPage() {
  const { albums, items, loadError } = await getGalleryContent();

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The ASAM media center"
        description="Photos, videos, and albums from ASAM events, programs, and community activities."
      />

      {loadError && (
        <div className="container mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Gallery content is temporarily unavailable.
          </p>
        </div>
      )}
      <GalleryBrowser albums={albums} items={items} />

      {/* Video Section */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Videos"
            title="Video content"
            description="Videos from ASAM events, interviews, and community features."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video rounded-2xl border border-dashed border-border bg-card flex items-center justify-center text-center p-4 hover:border-gold/30 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div>
                  <Video className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground font-medium">Video — Coming Soon</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Captured a great moment?"
        description="If you have photos or videos from ASAM events that you'd like to share, we'd love to feature them in our gallery."
        primaryLabel="Submit Media"
        primaryHref="/contact"
        secondaryLabel="View Events"
        secondaryHref="/events"
      />
    </>
  );
}
