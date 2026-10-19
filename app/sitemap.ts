import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/server';
import { getServerSiteUrl } from '@/lib/member/site-url';

const STATIC_PATHS = [
  '/',
  '/about',
  '/academic',
  '/alumni',
  '/career',
  '/chapters',
  '/contact',
  '/culture',
  '/departments',
  '/events',
  '/faq',
  '/gallery',
  '/governance',
  '/join',
  '/join-asam',
  '/leadership',
  '/membership',
  '/news',
  '/opportunities',
  '/partners',
  '/research',
  '/scholarships',
  '/sports',
  '/transparency',
  '/universities',
  '/verify',
  '/web-developer',
  '/welfare',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerSiteUrl();
  const lastModified = new Date();

  let albumPaths: string[] = [];
  try {
    const { data } = await createPublicClient()
      .from('gallery_albums')
      .select('id')
      .eq('status', 'published');
    albumPaths = (data ?? []).map((album) => `/gallery/${album.id}`);
  } catch {
    // Static routes still ship if the album read fails.
  }

  return [...STATIC_PATHS, ...albumPaths].map((path) => ({
    url: `${base}${path}`,
    lastModified,
  }));
}
