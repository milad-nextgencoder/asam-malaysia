import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/site/page-hero';
import { createClient } from '@/lib/supabase/server';
import { GalleryLightbox } from '@/components/site/gallery-lightbox';

export default async function GalleryAlbumPage({ params }: { params: { id: string } }) {
  const db = createClient();
  const { data: album } = await db.from('gallery_albums').select('id,name,description,category,status').eq('id', params.id).eq('status','published').maybeSingle();
  if (!album) notFound();
  const { data } = await db.from('gallery_items').select('id,image_url,title,caption,display_order').eq('album_id', album.id).eq('status','published').order('display_order').range(0,47);
  return <><PageHero eyebrow={album.category || 'Gallery'} title={album.name} description={album.description || 'Published ASAM photographs.'}/><section className="py-12"><div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><Link href="/gallery" className="mb-6 inline-block text-sm font-semibold text-gold-dark hover:underline">← Back to Gallery</Link>{data?.length ? <GalleryLightbox images={data} albumId={album.id}/> : <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">No published images in this album yet.</div>}</div></section></>;
}
