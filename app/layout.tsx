import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { createClient } from '@/lib/supabase/server';
import { getServerSiteUrl } from '@/lib/member/site-url';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

const baseMetadata: Metadata = {
  // Resolves absolute URLs for Open Graph/Twitter images and canonical links.
  metadataBase: new URL(getServerSiteUrl()),
  title: {
    default: 'Afghan Students Association of Malaysia (ASAM)',
    template: '%s — ASAM',
  },
  description:
    'Connecting Afghan students across Malaysia through education, leadership, opportunity, culture, and community. The national platform for Afghan students in Malaysia.',
  keywords: [
    'ASAM',
    'Afghan Students Association of Malaysia',
    'Afghan students Malaysia',
    'student association',
    'Afghan community Malaysia',
    'university network',
  ],
  authors: [{ name: 'ASAM' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://asam.org.my',
    siteName: 'Afghan Students Association of Malaysia',
    title: 'Afghan Students Association of Malaysia (ASAM)',
    description:
      'Connecting Afghan students across Malaysia through education, leadership, opportunity, culture, and community.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afghan Students Association of Malaysia (ASAM)',
    description:
      'Connecting Afghan students across Malaysia through education, leadership, opportunity, culture, and community.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await createClient().from('site_settings').select('organization_name,tagline,favicon_url').eq('singleton', true).maybeSingle();
    if (!data) return baseMetadata;
    const organization = data.organization_name || 'Afghan Students Association of Malaysia';
    const title = `${organization} (ASAM)`;
    return {
      ...baseMetadata,
      title: { default: title, template: `%s — ${organization}` },
      description: data.tagline || baseMetadata.description,
      icons: data.favicon_url && ((data.favicon_url.startsWith('/') && !data.favicon_url.startsWith('//')) || /^https:\/\//i.test(data.favicon_url)) ? { icon: data.favicon_url } : undefined,
      openGraph: { ...baseMetadata.openGraph, siteName: organization, title, description: data.tagline || baseMetadata.description },
    };
  } catch {
    return baseMetadata;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
